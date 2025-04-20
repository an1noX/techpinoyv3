
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Printer } from "@/types/printers";

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
        setPrinters([]);
      } else {
        setPrinters(data || []);
      }
      setLoading(false);
    }
    fetchPrinters();
    return () => { isMounted = false; };
  }, []);

  return { printers, loading };
}
