
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DatePickerField } from './DatePickerField';
import { MaintenanceLogType } from '@/types/types';

const maintenanceLogSchema = z.object({
  performedBy: z.string().min(1, { message: 'Technician name is required' }),
  date: z.date(),
  scheduled: z.boolean().optional(),
  scheduledDate: z.date().optional(),
  notes: z.string().min(1, { message: 'Maintenance description is required' })
});

type MaintenanceLogFormValues = z.infer<typeof maintenanceLogSchema>;

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
  
  const form = useForm<MaintenanceLogFormValues>({
    resolver: zodResolver(maintenanceLogSchema),
    defaultValues: {
      performedBy: '',
      date: new Date(),
      scheduled: false,
      notes: ''
    }
  });

  const handleSubmit = (data: MaintenanceLogFormValues) => {
    const log: MaintenanceLogType = {
      id: crypto.randomUUID(),
      printer_id: printerId,
      printer_model: printerModel,
      performed_by: data.performedBy,
      date: data.date.toISOString(),
      notes: data.notes,
      scheduled: Boolean(data.scheduled),
      scheduled_date: data.scheduledDate ? data.scheduledDate.toISOString() : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      
      // Add frontend compatibility fields
      printerId,
      performedBy: data.performedBy
    };

    onSubmit(log);
    form.reset();
  };

  const handleScheduledChange = (checked: boolean) => {
    setIsScheduled(checked);
    form.setValue('scheduled', checked);
    
    if (!checked) {
      form.setValue('scheduledDate', undefined);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="performedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Technician Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter technician name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Maintenance Date</FormLabel>
                <DatePickerField
                  date={field.value}
                  setDate={(date) => field.onChange(date)}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maintenance Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe the maintenance performed" 
                    className="min-h-[100px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="scheduled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Schedule for future</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value === true}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      handleScheduledChange(checked);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Only show scheduled date field if scheduled is true */}
          {isScheduled && (
            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Scheduled Date</FormLabel>
                  <DatePickerField
                    date={field.value}
                    setDate={(date) => field.onChange(date)}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Log</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
