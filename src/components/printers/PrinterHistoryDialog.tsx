
import React, { useState, useEffect } from "react";
import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/ui/button";
import { Printer } from "@/types/printers";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { History, Wrench, ArrowRight, Check } from "lucide-react";

interface HistoryRecord {
  id: string;
  created_at: string;
  type: "maintenance" | "transfer" | "repair";
  details: string;
  status?: string;
  from?: string;
  to?: string;
}

interface PrinterHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printer: Printer;
}

export const PrinterHistoryDialog: React.FC<PrinterHistoryDialogProps> = ({
  open,
  onOpenChange,
  printer,
}) => {
  const [loading, setLoading] = useState(true);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open, printer.id]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Fetch maintenance records
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from("maintenance_records")
        .select("*")
        .eq("printer_id", printer.id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch transfer logs
      const { data: transferData, error: transferError } = await supabase
        .from("transfer_logs")
        .select("*")
        .eq("printer_id", printer.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (maintenanceError) {
        throw maintenanceError;
      }

      if (transferError) {
        throw transferError;
      }

      // Transform maintenance records
      const maintenanceRecords = (maintenanceData || []).map(record => ({
        id: record.id,
        created_at: record.created_at,
        type: record.activity_type === "report" ? "maintenance" : "repair" as "maintenance" | "transfer" | "repair",
        details: record.issue_description || "Maintenance record",
        status: record.status,
      }));

      // Transform transfer logs
      const transferRecords = (transferData || []).map(record => ({
        id: record.id,
        created_at: record.created_at,
        type: "transfer" as "maintenance" | "transfer" | "repair",
        details: record.notes || "Printer transferred",
        from: record.from_client || record.from_department || "Unknown",
        to: record.to_client || record.to_department || "Unknown",
      }));

      // Combine and sort records
      const combinedRecords = [...maintenanceRecords, ...transferRecords]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setHistoryRecords(combinedRecords);
    } catch (error: any) {
      toast({
        title: "Failed to fetch history",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "maintenance":
        return <Wrench className="h-5 w-5 text-amber-500" />;
      case "repair":
        return <Check className="h-5 w-5 text-green-500" />;
      case "transfer":
        return <ArrowRight className="h-5 w-5 text-blue-500" />;
      default:
        return <History className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Printer History - ${printer.make} ${printer.model}`}
      size="md"
      footer={
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Showing the last 10 history entries for this printer including maintenance records, repairs, and transfers.
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : historyRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-md bg-gray-50">
            No history records found for this printer.
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {historyRecords.map((record) => (
              <div key={record.id} className="border rounded-md p-3 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {getIconForType(record.type)}
                    <span className="font-medium capitalize">{record.type}</span>
                    {record.status && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        record.status === "completed" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {record.status}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(record.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                <p className="text-sm">{record.details}</p>
                {record.type === "transfer" && (
                  <div className="mt-2 text-sm flex items-center gap-2">
                    <span>{record.from}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span>{record.to}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseDialog>
  );
};
