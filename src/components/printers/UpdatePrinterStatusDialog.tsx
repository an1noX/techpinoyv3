
import React, { useState } from "react";
import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Printer, PrinterStatus } from "@/types/printers";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const STATUS_OPTIONS: PrinterStatus[] = [
  "available",
  "deployed",
  "maintenance",
  "for_repair",
  "rented"
];

interface UpdatePrinterStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printer: Printer;
  onSuccess?: () => void;
}

export const UpdatePrinterStatusDialog: React.FC<UpdatePrinterStatusDialogProps> = ({
  open,
  onOpenChange,
  printer,
  onSuccess,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<PrinterStatus>(printer.status);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setSelectedStatus(printer.status);
  }, [open, printer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === printer.status) {
      toast({
        title: "No Status Change",
        description: "Select a different status before saving.",
        variant: "default",
      });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("printers")
      .update({ status: selectedStatus, updated_at: new Date().toISOString() })
      .eq("id", printer.id);
    setSubmitting(false);

    if (error) {
      toast({
        title: "Status Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Printer Status Updated",
        description: `Status updated to "${selectedStatus}".`,
        variant: "default",
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Update Status: ${printer.make} ${printer.model}`}
      size="sm"
      description="Choose a new status for this printer. This will immediately update its state in the inventory."
      footer={
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            type="button"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            form="update-printer-status-form"
          >
            {submitting ? "Updating..." : "Update Status"}
          </Button>
        </div>
      }
    >
      <form id="update-printer-status-form" onSubmit={handleSubmit}>
        <Label className="block mb-2">Select Printer Status</Label>
        <RadioGroup
          value={selectedStatus}
          onValueChange={val => setSelectedStatus(val as PrinterStatus)}
          className="flex flex-col space-y-2"
        >
          {STATUS_OPTIONS.map((status) => (
            <div className="flex items-center space-x-2" key={status}>
              <RadioGroupItem value={status} id={`status-${status}`} />
              <Label htmlFor={`status-${status}`} className="cursor-pointer capitalize">
                {status.replace(/_/g, " ")}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </form>
    </BaseDialog>
  );
};
