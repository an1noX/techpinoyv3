
import React, { useState } from "react";
import { BaseDetailDialog } from "@/components/common/BaseDetailDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Printer, MaintenanceStatus } from "@/types/printers";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CancelButton, SubmitButton } from "@/components/common/ActionButtons";
import { Wrench } from "lucide-react";

type ErrorKey = "drumkit_error" | "paper_jam" | "no_toner" | "custom";

const PREDEFINED_ERRORS: { key: ErrorKey; label: string; solution: string }[] = [
  {
    key: "drumkit_error",
    label: "Drumkit error",
    solution: "Replaced drumkit",
  },
  {
    key: "paper_jam",
    label: "Paper jam",
    solution: "Removed jam paper",
  },
  {
    key: "no_toner",
    label: "No toner / Low toner",
    solution: "Replaced toner",
  },
];

interface MaintenanceQuickUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printer: Printer;
  onSuccess?: () => void;
  isStatusOnly?: boolean;
}

export const MaintenanceQuickUpdateDialog: React.FC<MaintenanceQuickUpdateDialogProps> = ({
  open,
  onOpenChange,
  printer,
  onSuccess,
  isStatusOnly = false,
}) => {
  const [selectedError, setSelectedError] = useState<ErrorKey | null>(null);
  const [customError, setCustomError] = useState("");
  const [customSolution, setCustomSolution] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string>(printer.status);
  const { toast } = useToast();

  const getSolution = () => {
    if (selectedError === "custom") return customSolution;
    const found = PREDEFINED_ERRORS.find((e) => e.key === selectedError);
    return found ? found.solution : "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle status-only update if isStatusOnly is true
    if (isStatusOnly) {
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
      return;
    }
    
    // Original maintenance record creation logic
    if (!selectedError || (selectedError === "custom" && (!customError || !customSolution))) {
      toast({
        title: "Please fill all fields.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);

    const maintenanceData = {
      printer_id: printer.id,
      issue_description:
        selectedError === "custom"
          ? customError
          : PREDEFINED_ERRORS.find((e) => e.key === selectedError)?.label,
      repair_notes: getSolution(),
      status: "completed" as MaintenanceStatus,
    };

    const { error } = await supabase.from("maintenance_records").insert(maintenanceData);

    setSubmitting(false);

    if (error) {
      toast({
        title: "Failed to create maintenance record.",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Maintenance record added!",
        variant: "default",
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
      setSelectedError(null);
      setCustomError("");
      setCustomSolution("");
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
        form="quick-maintenance-form"
        className="flex items-center gap-2"
      >
        <Wrench className="h-4 w-4" />
        {isStatusOnly ? "Update Status" : "Submit Update"}
      </SubmitButton>
    </>
  );

  return (
    <BaseDetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isStatusOnly 
        ? `Update Status - ${printer.make} ${printer.model}` 
        : `Quick Update - ${printer.make} ${printer.model}`}
      size="sm"
      actionButtons={actionButtons}
    >
      <form id="quick-maintenance-form" onSubmit={handleSubmit}>
        {isStatusOnly ? (
          <div className="space-y-4">
            <Label className="block mb-2">Change Printer Status</Label>
            <RadioGroup 
              value={status} 
              onValueChange={setStatus}
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
        ) : (
          // Original maintenance form content
          <>
            <Label className="mb-2 block">Issue</Label>
            <div className="space-y-2 mb-2">
              {PREDEFINED_ERRORS.map((err) => (
                <label key={err.key} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value={err.key}
                    checked={selectedError === err.key}
                    onChange={() => setSelectedError(err.key)}
                  />
                  <span>{err.label}</span>
                </label>
              ))}
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="custom"
                  checked={selectedError === "custom"}
                  onChange={() => setSelectedError("custom")}
                />
                <span>Other (custom)</span>
              </label>
            </div>

            {selectedError === "custom" && (
              <div className="mt-2 flex flex-col gap-2">
                <Label htmlFor="custom-error">Custom Error</Label>
                <Input
                  id="custom-error"
                  placeholder="Describe the issue"
                  value={customError}
                  onChange={(e) => setCustomError(e.target.value)}
                  required
                />
                <Label htmlFor="custom-solution">Solution</Label>
                <Textarea
                  id="custom-solution"
                  placeholder="Describe how you resolved it"
                  value={customSolution}
                  onChange={(e) => setCustomSolution(e.target.value)}
                  required
                />
              </div>
            )}

            {selectedError && selectedError !== "custom" && (
              <div className="mt-3">
                <Label className="text-xs block mb-1">Solution</Label>
                <div className="px-3 py-2 rounded bg-muted">{getSolution()}</div>
              </div>
            )}
          </>
        )}
      </form>
    </BaseDetailDialog>
  );
};
