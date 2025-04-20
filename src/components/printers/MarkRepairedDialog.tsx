
import React, { useState } from "react";
import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/ui/button";
import { Printer, MaintenanceStatus } from "@/types/printers";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

interface MarkRepairedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printer: Printer;
  onSuccess?: () => void;
}

export const MarkRepairedDialog: React.FC<MarkRepairedDialogProps> = ({
  open,
  onOpenChange,
  printer,
  onSuccess,
}) => {
  const [repairReason, setRepairReason] = useState("");
  const [repairSolution, setRepairSolution] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const getAvailabilityStatus = () => {
    // Determine availability based on ownership
    if (printer.owned_by === "client") {
      return `Available (${printer.assigned_to || "Client"})`;
    } else {
      return "Available (System Unit)";
    }
  };

  const handleMarkRepaired = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairReason || !repairSolution) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);

    // First create a maintenance record
    const maintenanceData = {
      printer_id: printer.id,
      issue_description: repairReason,
      repair_notes: repairSolution,
      status: "completed" as MaintenanceStatus,
      activity_type: "repair",
    };

    const { error: maintenanceError } = await supabase
      .from("maintenance_records")
      .insert(maintenanceData);

    if (maintenanceError) {
      setSubmitting(false);
      toast({
        title: "Failed to create maintenance record.",
        description: maintenanceError.message,
        variant: "destructive",
      });
      return;
    }

    // Then update the printer status & notes (if supported)
    const prevStatus = printer.status;
    const prevNotes = printer.notes;
    const newNotes = prevNotes
      ? `${prevNotes}\nPreviously in ${prevStatus} status, marked as repaired on ${new Date().toLocaleDateString()}`
      : `Previously in ${prevStatus} status, marked as repaired on ${new Date().toLocaleDateString()}`;

    const { error: updateError } = await supabase
      .from("printers")
      .update({
        status: "available",
        notes: newNotes
      })
      .eq("id", printer.id);

    setSubmitting(false);

    if (updateError) {
      toast({
        title: "Failed to update printer status.",
        description: updateError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Printer marked as repaired!",
        description: `Status changed to ${getAvailabilityStatus()}`,
        variant: "default",
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
      setRepairReason("");
      setRepairSolution("");
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Mark as Repaired - ${printer.make} ${printer.model}`}
      size="sm"
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
            form="mark-repaired-form"
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Mark as Repaired
          </Button>
        </div>
      }
    >
      <form id="mark-repaired-form" onSubmit={handleMarkRepaired}>
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <h3 className="font-medium text-green-800 mb-2">Mark Printer as Repaired</h3>
            <p className="text-green-700 text-sm">
              This will change the printer status from <span className="font-semibold">{printer.status}</span> to <span className="font-semibold">{getAvailabilityStatus()}</span> and create a maintenance record.
            </p>
          </div>
          
          <div>
            <Label htmlFor="repair-reason" className="mb-2 block">Repair Reason</Label>
            <Textarea
              id="repair-reason"
              placeholder="Describe the issue that was repaired..."
              value={repairReason}
              onChange={(e) => setRepairReason(e.target.value)}
              className="min-h-[80px]"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="repair-solution" className="mb-2 block">Solution</Label>
            <Textarea
              id="repair-solution"
              placeholder="Describe how the issue was resolved..."
              value={repairSolution}
              onChange={(e) => setRepairSolution(e.target.value)}
              className="min-h-[80px]"
              required
            />
          </div>
        </div>
      </form>
    </BaseDialog>
  );
};
