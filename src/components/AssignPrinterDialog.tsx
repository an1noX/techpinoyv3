
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Client, Printer } from '@/types';
import { query } from '@/services/db';

interface AssignPrinterDialogProps {
  open: boolean;
  onOpenChange: () => void;
  printer: Printer;
  clients: Client[];
}

export function AssignPrinterDialog({ 
  open, 
  onOpenChange, 
  printer, 
  clients 
}: AssignPrinterDialogProps) {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState('');
  const [notes, setNotes] = useState('');

  const handleAssign = async () => {
    if (!selectedClient) {
      toast({
        title: "Error",
        description: "Please select a client",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update printer assignment
      await query(
        `UPDATE printers 
         SET client_id = ?, 
             assigned_to = ?, 
             status = 'rented',
             updated_at = NOW() 
         WHERE id = ?`,
        [selectedClient, clients.find(c => c.id === selectedClient)?.name, printer.id]
      );

      // Create assignment record
      await query(
        `INSERT INTO printer_client_assignments 
         (id, printer_id, client_id, assigned_at, notes, created_by) 
         VALUES (UUID(), ?, ?, NOW(), ?, ?)`,
        [printer.id, selectedClient, notes, 'system']
      );

      toast({
        title: "Success",
        description: "Printer assigned successfully"
      });

      onOpenChange();
    } catch (error) {
      console.error('Error assigning printer:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign printer",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Printer</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Printer</label>
            <Input 
              value={`${printer.make} ${printer.model}`}
              disabled
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Client</label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <Button variant="outline" onClick={onOpenChange}>Cancel</Button>
          <Button onClick={handleAssign}>Assign Printer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
