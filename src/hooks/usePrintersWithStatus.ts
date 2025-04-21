
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Printer } from "@/types/printers";
import { PrinterStatus } from "@/types/types";

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

    try {
      // Fetch printers
      const { data: printerData, error: printerErr } = await supabase
        .from("printers")
        .select("*");

      if (printerErr) {
        throw printerErr;
      }

      // Fetch latest maintenance record for each printer
      const { data: maintenanceData, error: maintenanceErr } = await supabase
        .from("maintenance_records")
        .select("printer_id,status,created_at")
        .order("created_at", { ascending: false });

      if (maintenanceErr) {
        console.error("Error fetching maintenance records:", maintenanceErr);
      }

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

      // Process the data to ensure it conforms to our types
      const typedPrinters: PrinterWithStatus[] = printerData.map((p: any) => ({
        ...p,
        status: validatePrinterStatus(p.status),
        owned_by: validateOwnershipType(p.owned_by),
        is_for_rent: !!p.is_for_rent,
        maintenanceStatus: statusMap[p.id] || "not_tracked",
      }));

      setPrinters(typedPrinters);
    } catch (error) {
      console.error("Error fetching printers:", error);
      setPrinters([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to validate data from Supabase
  const validatePrinterStatus = (status: any): PrinterStatus => {
    const validStatuses: PrinterStatus[] = ['available', 'rented', 'maintenance', 'for_repair', 'deployed'];
    return validStatuses.includes(status as PrinterStatus) 
      ? (status as PrinterStatus) 
      : 'available';
  };

  const validateOwnershipType = (ownership: any): 'system' | 'client' => {
    return ownership === 'client' ? 'client' : 'system';
  };

  return { printers, loading, refetch: fetchPrinters };
};
