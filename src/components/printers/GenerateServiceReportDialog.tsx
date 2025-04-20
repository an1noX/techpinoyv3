
import React, { useState } from "react";
import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Printer, MaintenanceStatus } from "@/types/printers";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";

interface GenerateServiceReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printer: Printer;
  onSuccess?: () => void;
}

export const GenerateServiceReportDialog: React.FC<GenerateServiceReportDialogProps> = ({
  open,
  onOpenChange,
  printer,
  onSuccess,
}) => {
  const [reportNotes, setReportNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

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
      status: "completed" as MaintenanceStatus,
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

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Generate Service Report - ${printer.make} ${printer.model}`}
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
            form="generate-report-form"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      }
    >
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
    </BaseDialog>
  );
};
