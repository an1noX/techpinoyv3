
import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerField } from './DatePickerField';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PrinterStatus } from '@/types/printers';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const COMMON_PROBLEMS = [
  { id: 'paper_jam', label: 'Paper Jam' },
  { id: 'drumkit_replacement', label: 'Drumkit Replacement' },
  { id: 'toner_replacement', label: 'Toner Replacement' },
  { id: 'driver_installation', label: 'Driver Installation' },
  { id: 'connectivity_issue', label: 'Connectivity Issue' },
  { id: 'print_quality', label: 'Print Quality Issue' },
  { id: 'noise', label: 'Unusual Noise' },
  { id: 'mechanical_failure', label: 'Mechanical Failure' },
];

const COMMON_SOLUTIONS = [
  { id: 'removed_paper_jam', label: 'Removed Paper Jam' },
  { id: 'replaced_drumkit', label: 'Replaced Drumkit' },
  { id: 'replaced_toner', label: 'Replaced Toner' },
  { id: 'installed_driver', label: 'Installed Driver' },
  { id: 'reset_printer', label: 'Reset Printer' },
  { id: 'cleaned_printer', label: 'Cleaned Printer' },
  { id: 'updated_firmware', label: 'Updated Firmware' },
  { id: 'repaired_hardware', label: 'Repaired Hardware' },
];

const STATUS_OPTIONS = [
  { value: 'maintenance', label: 'Pulled Out for Maintenance' },
  { value: 'for_repair', label: 'Pulled Out for Repair' },
];

const quickUpdateSchema = z.object({
  problems: z.array(z.string()).min(1, "Select at least one problem"),
  solutions: z.array(z.string()).min(1, "Select at least one solution"),
  statusChange: z.string().optional(),
  technician: z.string().min(2, "Technician name is required"),
  actionDate: z.date(),
  remarks: z.string().optional(),
});

type QuickUpdateFormValues = z.infer<typeof quickUpdateSchema>;

interface QuickUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printer: {
    id: string;
    make: string;
    model: string;
    status: PrinterStatus;
  };
  onSuccess: () => void;
}

export function QuickUpdateDialog({ 
  open, 
  onOpenChange, 
  printer, 
  onSuccess 
}: QuickUpdateDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<QuickUpdateFormValues>({
    resolver: zodResolver(quickUpdateSchema),
    defaultValues: {
      problems: [],
      solutions: [],
      statusChange: undefined,
      technician: '',
      actionDate: new Date(),
      remarks: '',
    },
  });

  const handleSubmit = async (values: QuickUpdateFormValues) => {
    try {
      setLoading(true);
      
      // Create a maintenance record
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_records')
        .insert([{
          printer_id: printer.id,
          status: 'completed',
          reported_by: values.technician,
          reported_at: values.actionDate.toISOString(),
          issue_description: values.problems
            .map(p => COMMON_PROBLEMS.find(cp => cp.id === p)?.label)
            .filter(Boolean)
            .join(', '),
          repair_notes: values.solutions
            .map(s => COMMON_SOLUTIONS.find(cs => cs.id === s)?.label)
            .filter(Boolean)
            .join(', '),
          technician: values.technician,
          started_at: values.actionDate.toISOString(),
          completed_at: values.actionDate.toISOString(),
          remarks: values.remarks,
          activity_type: 'repair',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();
      
      if (maintenanceError) throw maintenanceError;
      
      // Update printer status if status change is selected
      if (values.statusChange) {
        const { error: printerError } = await supabase
          .from('printers')
          .update({ 
            status: values.statusChange as PrinterStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', printer.id);
        
        if (printerError) throw printerError;
      }
      
      toast({
        title: "Quick update applied",
        description: "The printer maintenance record has been created successfully."
      });
      
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error applying quick update",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Quick Update for {printer.make} {printer.model}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Common Problems */}
            <FormField
              control={form.control}
              name="problems"
              render={() => (
                <FormItem>
                  <FormLabel>Common Problems</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {COMMON_PROBLEMS.map((problem) => (
                      <FormField
                        key={problem.id}
                        control={form.control}
                        name="problems"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={problem.id}
                              className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(problem.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, problem.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== problem.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {problem.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Common Solutions */}
            <FormField
              control={form.control}
              name="solutions"
              render={() => (
                <FormItem>
                  <FormLabel>Common Solutions</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {COMMON_SOLUTIONS.map((solution) => (
                      <FormField
                        key={solution.id}
                        control={form.control}
                        name="solutions"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={solution.id}
                              className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(solution.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, solution.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== solution.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {solution.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Status Change */}
            <FormField
              control={form.control}
              name="statusChange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Change Printer Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Keep current status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Technician */}
            <FormField
              control={form.control}
              name="technician"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technician</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Name of technician" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Action Date */}
            <FormField
              control={form.control}
              name="actionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Action</FormLabel>
                  <FormControl>
                    <DatePickerField field={field} label="Select date" isPastDateAllowed={true} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Remarks */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Additional notes or comments" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                    Applying...
                  </div>
                ) : 'Apply Quick Update'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
