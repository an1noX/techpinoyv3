
import { useState, useEffect } from 'react';
import { Printer, Client } from '@/types/printers';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const usePrinterDetail = (printerId: string) => {
  const [printer, setPrinter] = useState<Printer | null>(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const { toast } = useToast();

  const fetchPrinter = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('printers')
        .select('*')
        .eq('id', printerId)
        .single();
      
      if (error) throw error;
      setPrinter(data as Printer);
      
    } catch (error: any) {
      toast({
        title: "Error fetching printer details",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('company');

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error fetching clients",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updatePrinter = async (updates: Partial<Printer>) => {
    try {
      const { error } = await supabase
        .from('printers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', printerId);

      if (error) throw error;

      setPrinter(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Changes saved",
        description: "Printer details have been updated successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error saving changes",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deletePrinter = async () => {
    try {
      const { error } = await supabase
        .from('printers')
        .delete()
        .eq('id', printerId);
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting printer",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (printerId) {
      fetchPrinter();
      fetchClients();
    }
  }, [printerId]);

  return {
    printer,
    setPrinter,
    loading,
    clients,
    updatePrinter,
    deletePrinter,
    refetchPrinter: fetchPrinter
  };
};
