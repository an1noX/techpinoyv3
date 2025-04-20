
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MaintenanceLogType } from "@/types/types";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerField } from "./DatePickerField";

const maintenanceSchema = z.object({
  notes: z.string().min(5, "Notes must be at least 5 characters long"),
  performedBy: z.string().min(2, "Please enter who performed the maintenance"),
  date: z.date(),
  scheduled: z.boolean().default(false),
  scheduledDate: z.date().optional(),
});

type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

interface MaintenanceLogFormProps {
  printerId: string;
  printerModel: string;
  onSubmit: (log: MaintenanceLogType) => void;
  onCancel: () => void;
}

export function MaintenanceLogForm({ 
  printerId, 
  printerModel, 
  onSubmit, 
  onCancel 
}: MaintenanceLogFormProps) {
  const [isScheduled, setIsScheduled] = useState(false);

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      notes: "",
      performedBy: "",
      date: new Date(),
      scheduled: false,
    }
  });

  const handleSubmit = (data: MaintenanceFormValues) => {
    const newLog: MaintenanceLogType = {
      id: `log-${Date.now()}`,
      printerId,
      printerModel,
      date: data.date.toISOString(),
      notes: data.notes,
      performedBy: data.performedBy,
      scheduled: data.scheduled,
      scheduledDate: data.scheduledDate ? data.scheduledDate.toISOString() : undefined,
    };

    onSubmit(newLog);
  };

  return (
    <Form {...form}>
      <form id="maintenance-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <DatePickerField 
              field={field} 
              label="Maintenance Date" 
              isPastDateAllowed={true} 
            />
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maintenance Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the maintenance performed" 
                  className="min-h-[120px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="performedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Performed By</FormLabel>
              <FormControl>
                <Input placeholder="Technician name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="scheduled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    setIsScheduled(!!checked);
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Schedule Next Maintenance</FormLabel>
              </div>
            </FormItem>
          )}
        />
        
        {isScheduled && (
          <FormField
            control={form.control}
            name="scheduledDate"
            render={({ field }) => (
              <DatePickerField 
                field={field} 
                label="Next Maintenance Date" 
                isPastDateAllowed={false} 
              />
            )}
          />
        )}
      </form>
    </Form>
  );
}
