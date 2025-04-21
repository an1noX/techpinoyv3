import React, { useState } from "react";
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast";
import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

interface MaintenanceLogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printerId: string;
  printerModel: string;
  onSubmit: (log: any) => void;
  onClose?: () => void;
}

interface FormValues {
  performedBy: string;
  date: Date;
  notes: string;
  scheduled: boolean;
  scheduledDate: Date;
}

export function MaintenanceLogForm({
  open,
  onOpenChange,
  printerId,
  printerModel,
  onSubmit,
  onClose,
}: MaintenanceLogFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>({
    performedBy: "",
    date: new Date(),
    notes: "",
    scheduled: false,
    scheduledDate: new Date(),
  });

  const reset = () => {
    setValues({
      performedBy: "",
      date: new Date(),
      notes: "",
      scheduled: false,
      scheduledDate: new Date(),
    });
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      const logData = {
        printer_id: printerId, // Use snake_case for database field
        printerId: printerId, // Add camelCase for frontend compatibility 
        printer_model: printerModel,
        performed_by: values.performedBy,
        performedBy: values.performedBy, // Add camelCase for frontend compatibility
        date: new Date(values.date).toISOString(),
        notes: values.notes,
        scheduled: values.scheduled,
        scheduled_date: values.scheduled ? new Date(values.scheduledDate).toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Submit the log to Supabase or pass it to the parent component
      onSubmit(logData);
      
      // Reset the form
      reset();
      
      // Close dialog if provided
      onClose?.();
      
    } catch (error) {
      console.error("Error submitting maintenance log:", error);
      setSubmitError("Failed to submit maintenance log.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Maintenance Log</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(values);
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="performedBy" className="text-right">
                Performed By
              </Label>
              <Input
                type="text"
                id="performedBy"
                value={values.performedBy}
                onChange={(e) => setValues({ ...values, performedBy: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !values.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {values.date ? format(values.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={values.date}
                    onSelect={(date) => setValues({ ...values, date: date || new Date() })}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <textarea
                id="notes"
                value={values.notes}
                onChange={(e) => setValues({ ...values, notes: e.target.value })}
                className="col-span-3 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="scheduled" className="text-right">
                Scheduled
              </Label>
              <Checkbox
                id="scheduled"
                checked={values.scheduled}
                onCheckedChange={(checked) => setValues({ ...values, scheduled: checked || false })}
              />
            </div>
            {values.scheduled && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="scheduledDate" className="text-right">
                  Scheduled Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !values.scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {values.scheduledDate ? format(values.scheduledDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={values.scheduledDate}
                      onSelect={(date) => setValues({ ...values, scheduledDate: date || new Date() })}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
          {submitError && (
            <p className="text-red-500 text-sm mt-2">{submitError}</p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
