import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Client } from '@/services/clients';
import { Printer } from '@/types';
import { assignPrinterToClient } from '@/services/clients';
import { getPrinters, updatePrinter } from '@/services/printers';

interface AssignPrinterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
  clientName?: string;
  onAssigned?: () => void;
}

export function AssignPrinterDialog({ 
  open, 
  onOpenChange, 
  clientId, 
  clientName,
  onAssigned 
}: AssignPrinterDialogProps) {
  const { toast } = useToast();
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    if (open) {
      fetchPrinters();
    }
  }, [open]);
  
  const fetchPrinters = async () => {
    try {
      setLoading(true);
      const printersData = await getPrinters();
      
      // Convert MariaDB printer objects to match the Printer type from @/types
      const convertedPrinters: Printer[] = printersData.map(printer => ({
        id: printer.id,
        make: printer.make,
        model: printer.model,
        status: printer.status as any, // Cast to PrinterStatus type
        ownedBy: printer.ownedBy,
        assignedTo: printer.assignedTo,
        series: printer.series,
        department: printer.department || undefined,
        location: printer.location || undefined,
        isForRent: printer.isForRent,
        createdAt: printer.createdAt,
        updatedAt: printer.updatedAt,
        clientId: printer.clientId
      }));
      
      setPrinters(convertedPrinters);
    } catch (error) {
      console.error('Error fetching printers:', error);
      toast({
        title: "Error fetching printers",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPrinter = async () => {
    if (!selectedPrinter) {
      toast({
        title: "Error",
        description: "Please select a printer to assign",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: printerData, error: printerError } = await updatePrinter(selectedPrinter, {
        status: 'rented',
        assignedTo: clientName,
        clientId: clientId
      });

      if (printerError) {
        throw printerError;
      }

      const { error: assignmentError } = await assignPrinterToClient(clientId, selectedPrinter, notes);

      if (assignmentError) {
        throw assignmentError;
      }

      toast({
        title: "Success",
        description: "Printer assigned successfully",
      });

      onOpenChange(false);
      setSelectedPrinter('');
      setNotes('');
      onAssigned?.();
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
          <DialogTitle>Assign Printer to {clientName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Printer</label>
            {loading ? (
              <div className="flex justify-center py-2">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a printer to assign" />
                </SelectTrigger>
                <SelectContent>
                  {printers.map(printer => (
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
