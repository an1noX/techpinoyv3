
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WikiPrinter, PrinterStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImportPrinterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: () => void;
}

export function ImportPrinterDialog({ open, onOpenChange, onImportSuccess }: ImportPrinterDialogProps) {
  const { toast } = useToast();
  const [wikiPrinters, setWikiPrinters] = useState<WikiPrinter[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWikiPrinter, setSelectedWikiPrinter] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  useEffect(() => {
    if (open) {
      fetchWikiPrinters();
    }
  }, [open]);

  const fetchWikiPrinters = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('printer_wiki')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setWikiPrinters(data as WikiPrinter[]);
    } catch (error: any) {
      toast({
        title: "Error fetching wiki printers",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportPrinter = async () => {
    if (!selectedWikiPrinter) {
      toast({
        title: "Error",
        description: "Please select a printer to import",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedPrinter = wikiPrinters.find(p => p.id === selectedWikiPrinter);
      
      if (!selectedPrinter) {
        throw new Error("Selected printer not found in wiki");
      }

      const { data, error } = await supabase
        .from('printers')
        .insert({
          make: selectedPrinter.make,
          series: selectedPrinter.series,
          model: selectedPrinter.model,
          status: 'available' as PrinterStatus,
          owned_by: 'system',
          department: department || null,
          location: location || null,
          is_for_rent: false
        })
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `${selectedPrinter.make} ${selectedPrinter.model} imported successfully`,
      });

      onOpenChange(false);
      setSelectedWikiPrinter('');
      setDepartment('');
      setLocation('');
      onImportSuccess();
    } catch (error: any) {
      toast({
        title: "Error importing printer",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Printer from Wiki</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Printer Model</label>
            {loading ? (
              <div className="flex justify-center py-2">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <Select value={selectedWikiPrinter} onValueChange={setSelectedWikiPrinter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a printer model" />
                </SelectTrigger>
                <SelectContent>
                  {wikiPrinters.map(printer => (
                    <SelectItem key={printer.id} value={printer.id}>
                      {printer.make} {printer.series} {printer.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <Input 
              placeholder="Marketing, Sales, IT..." 
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input 
              placeholder="Floor 2, Room 201..." 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleImportPrinter}>Import Printer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
