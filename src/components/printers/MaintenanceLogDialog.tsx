
import { useState } from "react";
import { MaintenanceLogType } from "@/types/types";
import { BaseDialog } from "@/components/common/BaseDialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

const maintenanceFormSchema = z.object({
  date: z.date(),
  scheduledDate: z.date().optional(),
  notes: z.string().min(1, { message: "Maintenance notes are required" }),
  scheduled: z.boolean().default(false),
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

interface MaintenanceLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printerId: string;
  printerModel: string;
  onAddLog: (log: MaintenanceLogType) => void;
}

export function MaintenanceLogDialog({
  open,
  onOpenChange,
  printerId,
  printerModel,
  onAddLog
}: MaintenanceLogDialogProps) {
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      date: new Date(),
      notes: "",
      scheduled: false
    }
  });

  const onSubmit = (data: MaintenanceFormValues) => {
    const newLog: MaintenanceLogType = {
      id: crypto.randomUUID(),
      printer_id: printerId, // Changed from printerId to printer_id to match type
      printer_model: printerModel,
      date: format(data.date, "yyyy-MM-dd"),
      scheduled_date: data.scheduledDate ? format(data.scheduledDate, "yyyy-MM-dd") : undefined,
      notes: data.notes,
      scheduled: data.scheduled,
      performed_by: "Current User", // In a real app, this would come from auth context
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    onAddLog(newLog);
    form.reset();
    onOpenChange(false);
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Maintenance Log"
      description="Record a maintenance event for this printer"
      size="md"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value}
                    setDate={field.onChange}
                    className="w-full"
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
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="m-0">Schedule future maintenance</FormLabel>
              </FormItem>
            )}
          />
          
          {form.watch("scheduled") && (
            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value || new Date()}
                      setDate={field.onChange}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Maintenance details..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Maintenance Log</Button>
          </div>
        </form>
      </Form>
    </BaseDialog>
  );
}
