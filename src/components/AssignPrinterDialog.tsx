
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Printer, PrinterStatus } from '@/types';

interface AssignPrinterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    id: string;
    name: string;
  };
  onAssignSuccess: () => void;
}

export function AssignPrinterDialog({ 
  open, 
  onOpenChange, 
  client,
  onAssignSuccess 
}: AssignPrinterDialogProps) {
  const { toast } = useToast();
  const [availablePrinters, setAvailablePrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (open) {
      fetchAvailablePrinters();
    }
  }, [open]);

  const fetchAvailablePrinters = async () => {
    try {
      setLoading(true);
      
      // Fetch available printers (status = 'available')
      const { data, error } = await supabase
        .from('printers')
        .select('*')
        .eq('status', 'available');
      
      if (error) {
        throw error;
      }

      // Transform database records to Printer objects
      const transformedPrinters: Printer[] = (data || []).map(printer => ({
        id: printer.id,
        make: printer.make,
        series: printer.series,
        model: printer.model,
        status: printer.status as PrinterStatus,
        ownedBy: printer.owned_by,
        assignedTo: printer.assigned_to || undefined,
        department: printer.department || undefined,
        location: printer.location || undefined,
        createdAt: printer.created_at,
        updatedAt: printer.updated_at,
        isForRent: printer.is_for_rent || false
      }));
      
      setAvailablePrinters(transformedPrinters);
    } catch (error: any) {
      toast({
        title: "Error fetching available printers",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPrinter = async () => {
    if (!selectedPrinterId) {
      toast({
        title: "Error",
        description: "Please select a printer to assign",
        variant: "destructive"
      });
      return;
    }

    try {
      // Start a transaction to update multiple tables
      const { data: printerData, error: printerError } = await supabase
        .from('printers')
        .update({ 
          status: 'rented', 
          assigned_to: client.name,
          client_id: client.id
        })
        .eq('id', selectedPrinterId)
        .select();

      if (printerError) {
        throw printerError;
      }

      // Add record to printer_client_assignments
      const { error: assignmentError } = await supabase
        .from('printer_client_assignments')
        .insert({
          printer_id: selectedPrinterId,
          client_id: client.id,
          notes: notes || null,
          created_by: 'system' // Replace with actual user ID if available
        });

      if (assignmentError) {
        throw assignmentError;
      }

      toast({
        title: "Success",
        description: "Printer assigned successfully",
      });

      onOpenChange(false);
      setSelectedPrinterId('');
      setNotes('');
      onAssignSuccess();
    } catch (error: any) {
      toast({
        title: "Error assigning printer",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Printer to {client.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Printer</label>
            {loading ? (
              <div className="flex justify-center py-2">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <Select value={selectedPrinterId} onValueChange={setSelectedPrinterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a printer to assign" />
                </SelectTrigger>
                <SelectContent>
                  {availablePrinters.map(printer => (
                    <SelectItem key={printer.id} value={printer.id}>
                      {printer.make} {printer.model} - {printer.location || 'No location'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea 
              placeholder="Add any notes about this assignment..." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAssignPrinter}>Assign Printer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
