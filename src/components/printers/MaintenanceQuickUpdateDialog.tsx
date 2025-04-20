
import React, { useState } from "react";
import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Printer } from "@/types/printers";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
}

export const MaintenanceQuickUpdateDialog: React.FC<MaintenanceQuickUpdateDialogProps> = ({
  open,
  onOpenChange,
  printer,
  onSuccess,
}) => {
  const [selectedError, setSelectedError] = useState<ErrorKey | null>(null);
  const [customError, setCustomError] = useState("");
  const [customSolution, setCustomSolution] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const getSolution = () => {
    if (selectedError === "custom") return customSolution;
    const found = PREDEFINED_ERRORS.find((e) => e.key === selectedError);
    return found ? found.solution : "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      status: "completed" as const, // Use type assertion to match the enum type
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
        variant: "default", // Changed from 'success' to 'default'
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
      // Reset state
      setSelectedError(null);
      setCustomError("");
      setCustomSolution("");
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Quick Update - ${printer.make} ${printer.model}`}
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
          <Button type="submit" disabled={submitting} form="quick-maintenance-form">
            Submit
          </Button>
        </div>
      }
    >
      <form id="quick-maintenance-form" onSubmit={handleSubmit}>
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
      </form>
    </BaseDialog>
  );
};
