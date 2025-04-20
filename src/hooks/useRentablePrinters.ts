
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Printer, PrinterStatus } from "@/types/printers";

export function useRentablePrinters() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchPrinters() {
      setLoading(true);
      const { data, error } = await supabase
        .from("printers")
        .select("*")
        .eq("is_for_rent", true)
        .eq("status", "available")
        .eq("owned_by", "system");
      
      if (!isMounted) return;
      
      if (error) {
        console.error("Error fetching rentable printers:", error);
        setPrinters([]);
      } else {
        // Transform the data to match the Printer type
        const typedPrinters: Printer[] = (data || []).map(printer => ({
          ...printer,
          // Ensure status is properly typed as PrinterStatus
          status: printer.status as PrinterStatus,
        }));
        setPrinters(typedPrinters);
      }
      setLoading(false);
    }
    
    fetchPrinters();
    return () => { isMounted = false; };
  }, []);

  return { printers, loading };
}
