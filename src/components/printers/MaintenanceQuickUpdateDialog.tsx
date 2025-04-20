
import React, { useState } from "react";
import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Printer } from "@/types/printers";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, FileText, Wrench } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<string>("quick-update");
  const [selectedError, setSelectedError] = useState<ErrorKey | null>(null);
  const [customError, setCustomError] = useState("");
  const [customSolution, setCustomSolution] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const getSolution = () => {
    if (selectedError === "custom") return customSolution;
    const found = PREDEFINED_ERRORS.find((e) => e.key === selectedError);
    return found ? found.solution : "";
  };

  const getAvailabilityStatus = () => {
    // Determine availability based on ownership
    if (printer.owned_by === "client") {
      return `Available (${printer.assigned_to || "Client"})`;
    } else {
      return "Available (System Unit)";
    }
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
      status: "completed" as const, // Using type assertion to match enum type
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
      // Reset state
      setSelectedError(null);
      setCustomError("");
      setCustomSolution("");
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportNotes) {
      toast({
        title: "Please enter report notes.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);

    const reportData = {
      printer_id: printer.id,
      issue_description: `Maintenance report for ${printer.make} ${printer.model}`,
      repair_notes: reportNotes,
      status: "completed" as const,
      activity_type: "report",
    };

    const { error } = await supabase.from("maintenance_records").insert(reportData);

    setSubmitting(false);

    if (error) {
      toast({
        title: "Failed to generate report.",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Report generated successfully!",
        variant: "default",
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
      setReportNotes("");
    }
  };

  const handleMarkRepaired = async () => {
    setSubmitting(true);

    // First create a maintenance record
    const maintenanceData = {
      printer_id: printer.id,
      issue_description: "Routine maintenance",
      repair_notes: "Device repaired and operational",
      status: "completed" as const,
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

    // Then update the printer status
    const { error: updateError } = await supabase
      .from("printers")
      .update({ 
        status: "available",
        // Add a note about previous status
        notes: printer.notes ? 
          `${printer.notes}\nPreviously in ${printer.status} status, marked as repaired on ${new Date().toLocaleDateString()}` : 
          `Previously in ${printer.status} status, marked as repaired on ${new Date().toLocaleDateString()}`
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
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Maintenance - ${printer.make} ${printer.model}`}
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
          {activeTab === "quick-update" && (
            <Button type="submit" disabled={submitting} form="quick-maintenance-form">
              Submit Update
            </Button>
          )}
          {activeTab === "generate-report" && (
            <Button type="submit" disabled={submitting} form="generate-report-form">
              Generate Report
            </Button>
          )}
          {activeTab === "mark-repaired" && (
            <Button 
              type="button" 
              disabled={submitting} 
              onClick={handleMarkRepaired}
              className="bg-green-600 hover:bg-green-700"
            >
              Mark as Repaired
            </Button>
          )}
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="quick-update" className="flex items-center gap-1">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Quick Update</span>
          </TabsTrigger>
          <TabsTrigger value="generate-report" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Generate Report</span>
          </TabsTrigger>
          <TabsTrigger value="mark-repaired" className="flex items-center gap-1">
            <Check className="h-4 w-4" />
            <span className="hidden sm:inline">Mark Repaired</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick-update">
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
        </TabsContent>

        <TabsContent value="generate-report">
          <form id="generate-report-form" onSubmit={handleGenerateReport}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="report-notes" className="mb-2 block">Maintenance Report</Label>
                <Textarea
                  id="report-notes"
                  placeholder="Enter detailed maintenance report notes..."
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  className="min-h-[120px]"
                  required
                />
              </div>
              <div className="bg-amber-50 p-3 rounded-md text-sm text-amber-800 border border-amber-200">
                <p>Generating a report will create a maintenance record for this printer.</p>
              </div>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="mark-repaired">
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="font-medium text-green-800 mb-2">Mark Printer as Repaired</h3>
              <p className="text-green-700 text-sm">
                This will change the printer status from <span className="font-semibold">{printer.status}</span> to <span className="font-semibold">{getAvailabilityStatus()}</span> and create a maintenance record.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
              <p>Note: This action will create a maintenance record showing this device has been repaired.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </BaseDialog>
  );
};
