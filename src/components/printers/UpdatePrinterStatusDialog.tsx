
import React, { useState } from "react";
import { BaseDetailDialog } from "@/components/common/BaseDetailDialog";
import { Printer, PrinterStatus } from "@/types/printers";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CancelButton, SubmitButton } from "@/components/common/ActionButtons";

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
  const [status, setStatus] = useState<PrinterStatus>(printer.status);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status === printer.status) {
      toast({
        title: "No changes to save",
        description: "The status hasn't changed.",
        variant: "default",
      });
      return;
    }
    
    setSubmitting(true);
    
    const { error } = await supabase
      .from("printers")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", printer.id);
    
    setSubmitting(false);
    
    if (error) {
      toast({
        title: "Failed to update printer status.",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status updated!",
        variant: "default",
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }
  };

  const actionButtons = (
    <>
      <CancelButton 
        disabled={submitting} 
        onClick={() => onOpenChange(false)} 
      />
      <SubmitButton 
        disabled={submitting}
        form="update-status-form" 
      >
        Update Status
      </SubmitButton>
    </>
  );

  return (
    <BaseDetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Update Status - ${printer.make} ${printer.model}`}
      size="sm"
      actionButtons={actionButtons}
    >
      <form id="update-status-form" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Label className="block mb-2">Change Printer Status</Label>
          <RadioGroup 
            value={status} 
            onValueChange={setStatus as any}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="available" id="status-available" />
              <Label htmlFor="status-available" className="cursor-pointer">Available</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="deployed" id="status-deployed" />
              <Label htmlFor="status-deployed" className="cursor-pointer">Deployed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="maintenance" id="status-maintenance" />
              <Label htmlFor="status-maintenance" className="cursor-pointer">Maintenance</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="for_repair" id="status-for_repair" />
              <Label htmlFor="status-for_repair" className="cursor-pointer">For Repair</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rented" id="status-rented" />
              <Label htmlFor="status-rented" className="cursor-pointer">Rented</Label>
            </div>
          </RadioGroup>
        </div>
      </form>
    </BaseDetailDialog>
  );
};
