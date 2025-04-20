
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DatePickerField } from './DatePickerField';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage, 
  FormDescription 
} from '@/components/ui/form';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Printer } from '@/types/printers';
import { MaintenanceStatus } from '@/types/printers';

const maintenanceSchema = z.object({
  printerId: z.string().uuid("Invalid printer ID"),
  issue_description: z.string().min(10, "Please provide a more detailed description of the issue").max(500),
  reported_by: z.string().min(2, "Reporter name is required"),
  reported_at: z.date(),
  status: z.enum(["pending", "in_progress", "completed", "unrepairable", "decommissioned"]).default("pending"),
  diagnosis_date: z.date().optional(),
  diagnosed_by: z.string().optional(),
  diagnostic_notes: z.string().optional(),
  activity_type: z.enum(["repair", "maintenance"]).default("repair"),
  started_at: z.date().optional(),
  completed_at: z.date().optional(),
  technician: z.string().optional(),
  repair_notes: z.string().optional(),
  parts_used: z.string().optional(),
  cost: z.string().optional().transform(val => val ? parseFloat(val) : null),
  next_maintenance_date: z.date().optional(),
  remarks: z.string().optional(),
});

type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

interface MaintenanceFormProps {
  printer?: Printer | null;
  existingRecord?: any;
  onSubmit: (data: MaintenanceFormValues) => Promise<void>;
  onCancel: () => void;
  mode?: 'create' | 'edit';
}

export function MaintenanceForm({ 
  printer, 
  existingRecord,
  onSubmit, 
  onCancel, 
  mode = 'create' 
}: MaintenanceFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState<'repair' | 'maintenance'>(
    existingRecord?.activity_type || 'repair'
  );

  // Initialize form with default values or existing record data
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: existingRecord ? {
      ...existingRecord,
      reported_at: existingRecord.reported_at ? new Date(existingRecord.reported_at) : new Date(),
      diagnosis_date: existingRecord.diagnosis_date ? new Date(existingRecord.diagnosis_date) : undefined,
      started_at: existingRecord.started_at ? new Date(existingRecord.started_at) : undefined,
      completed_at: existingRecord.completed_at ? new Date(existingRecord.completed_at) : undefined,
      next_maintenance_date: existingRecord.next_maintenance_date ? new Date(existingRecord.next_maintenance_date) : undefined,
      cost: existingRecord.cost ? String(existingRecord.cost) : undefined,
    } : {
      printerId: printer?.id || '',
      issue_description: '',
      reported_by: '',
      reported_at: new Date(),
      status: 'pending',
      activity_type: 'repair',
    } as MaintenanceFormValues
  });

  const handleFormSubmit = async (data: MaintenanceFormValues) => {
    try {
      setLoading(true);
      await onSubmit(data);
    } catch (error: any) {
      toast({
        title: "Error saving maintenance record",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Update the selected activity type when the form value changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.activity_type) {
        setSelectedActivityType(value.activity_type as 'repair' | 'maintenance');
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Printer Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Printer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {printer && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Printer ID:</p>
                  <p>{printer.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Model & Brand:</p>
                  <p>{printer.make} {printer.model}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Location:</p>
                  <p>{printer.location || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Department:</p>
                  <p>{printer.department || 'Not specified'}</p>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="unrepairable">Unrepairable</SelectItem>
                      <SelectItem value="decommissioned">Decommissioned</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Reported Issue Section */}
        <Card>
          <CardHeader>
            <CardTitle>Reported Issue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="reported_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Reported</FormLabel>
                  <FormControl>
                    <DatePickerField 
                      field={field} 
                      label="Select date" 
                      isPastDateAllowed={true} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reported_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reported By</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Name of person who reported the issue" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="issue_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Detailed description of the reported issue" 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Diagnostic Section */}
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="diagnosis_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis Date</FormLabel>
                  <FormControl>
                    <DatePickerField 
                      field={field} 
                      label="Select date" 
                      isPastDateAllowed={true} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diagnosed_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosed By</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Name of technician who diagnosed the issue" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diagnostic_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnostic Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Technical diagnosis and findings" 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Repair/Maintenance Section */}
        <Card>
          <CardHeader>
            <CardTitle>Repair / Maintenance Action</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="activity_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Activity</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedActivityType(value as 'repair' | 'maintenance');
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="started_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Started</FormLabel>
                    <FormControl>
                      <DatePickerField 
                        field={field} 
                        label="Select date" 
                        isPastDateAllowed={true} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="completed_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Completed</FormLabel>
                    <FormControl>
                      <DatePickerField 
                        field={field} 
                        label="Select date" 
                        isPastDateAllowed={true} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="technician"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Performed By</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Name of technician who performed the work" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="repair_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {selectedActivityType === 'repair' ? 'Resolution / Actions Taken' : 'Maintenance Performed'}
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder={
                        selectedActivityType === 'repair' 
                          ? "Detailed description of repair actions" 
                          : "Detailed description of maintenance performed"
                      } 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parts_used"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parts Replaced / Used</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="List of parts used during the repair/maintenance" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Incurred</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      {...field} 
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedActivityType === 'maintenance' && (
              <FormField
                control={form.control}
                name="next_maintenance_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Scheduled Maintenance</FormLabel>
                    <FormControl>
                      <DatePickerField 
                        field={field} 
                        label="Select date" 
                        isPastDateAllowed={false} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Status Update Section */}
        <Card>
          <CardHeader>
            <CardTitle>Final Status & Remarks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Remarks</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Any additional comments or recommendations" 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                Saving...
              </div>
            ) : mode === 'create' ? 'Create Record' : 'Update Record'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
