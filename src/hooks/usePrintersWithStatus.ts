
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Printer } from "@/types/printers";

export interface PrinterWithStatus extends Printer {
  maintenanceStatus?: string; // pending, in_progress, completed, or undefined
}

export const usePrintersWithStatus = () => {
  const [printers, setPrinters] = useState<PrinterWithStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPrinters();
  }, []);

  const fetchPrinters = async () => {
    setLoading(true);

    // Fetch printers
    const { data: printerData, error: printerErr } = await supabase
      .from("printers")
      .select("*");

    if (printerErr || !printerData) {
      setPrinters([]);
      setLoading(false);
      return;
    }

    // Fetch latest maintenance record for each printer
    const { data: maintenanceData } = await supabase
      .from("maintenance_records")
      .select("printer_id,status,created_at")
      .order("created_at", { ascending: false });

    const statusMap: Record<string, string> = {};
    if (maintenanceData) {
      maintenanceData.forEach(
        (rec: { printer_id: string; status: string }) => {
          // only set if not already set so we get the latest by created_at
          if (rec.printer_id && !statusMap[rec.printer_id]) {
            statusMap[rec.printer_id] = rec.status;
          }
        }
      );
    }

    // Type assertion to ensure the data is treated as Printer[]
    const printersWithTypes = printerData as unknown as Printer[];
    
    const merged = printersWithTypes.map((p: Printer) => ({
      ...p,
      maintenanceStatus: statusMap[p.id] || "not_tracked",
    }));

    setPrinters(merged);
    setLoading(false);
  };

  return { printers, loading, refetch: fetchPrinters };
};
