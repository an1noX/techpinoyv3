
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, Client } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PrinterTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printer: Printer;
  onTransferSuccess: () => void;
}

export function PrinterTransferDialog({
  open,
  onOpenChange,
  printer,
  onTransferSuccess
}: PrinterTransferDialogProps) {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [transferType, setTransferType] = useState('department');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [customDepartment, setCustomDepartment] = useState<string>('');
  const [customLocation, setCustomLocation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (open) {
      fetchClients();
      extractDepartments();
    }
  }, [open]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setClients(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching clients",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const extractDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('printers')
        .select('department')
        .not('department', 'is', null);
      
      if (error) {
        throw error;
      }
      
      // Extract unique departments
      const uniqueDepartments = Array.from(
        new Set(data.map(item => item.department).filter(Boolean))
      ) as string[];
      
      setDepartments(uniqueDepartments);
    } catch (error: any) {
      toast({
        title: "Error fetching departments",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleTransfer = async () => {
    try {
      setLoading(true);
      
      if (transferType === 'client' && !selectedClient) {
        toast({
          title: "Error",
          description: "Please select a client",
          variant: "destructive"
        });
        return;
      }
      
      if (transferType === 'department' && !selectedDepartment && !customDepartment) {
        toast({
          title: "Error",
          description: "Please select or enter a department",
          variant: "destructive"
        });
        return;
      }

      let updatedData: any = {
        status: 'assigned',
        updated_at: new Date().toISOString()
      };

      if (transferType === 'client') {
        const client = clients.find(c => c.id === selectedClient);
        updatedData = {
          ...updatedData,
          client_id: selectedClient,
          assigned_to: client?.name || 'Unknown client',
          owned_by: 'client',
          department: null
        };

        // Also create an assignment record
        const { error: assignmentError } = await supabase
          .from('printer_client_assignments')
          .insert([{
            printer_id: printer.id,
            client_id: selectedClient,
            notes: notes || null
          }]);

        if (assignmentError) {
          throw assignmentError;
        }
      } else {
        const department = customDepartment || selectedDepartment;
        updatedData = {
          ...updatedData,
          client_id: null,
          assigned_to: null,
          owned_by: 'system',
          department: department,
          location: customLocation || printer.location
        };
      }

      const { error } = await supabase
        .from('printers')
        .update(updatedData)
        .eq('id', printer.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: `Printer successfully ${transferType === 'client' ? 'assigned to client' : 'transferred to department'}`
      });
      
      onTransferSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer/Assign Printer</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="department" onValueChange={value => setTransferType(value)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="department">To Department</TabsTrigger>
            <TabsTrigger value="client">To Client</TabsTrigger>
          </TabsList>
          
          <TabsContent value="department" className="space-y-4 pt-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Select Department</h3>
              <Select 
                value={selectedDepartment} 
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept, index) => (
                    <SelectItem key={index} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Or Enter New Department</h3>
              <Input 
                placeholder="Enter department name" 
                value={customDepartment}
                onChange={(e) => setCustomDepartment(e.target.value)}
              />
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Location</h3>
              <Input 
                placeholder="Floor, Room, etc." 
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="client" className="space-y-4 pt-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Select Client</h3>
              <Select 
                value={selectedClient} 
                onValueChange={setSelectedClient}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Notes</h3>
              <Input 
                placeholder="Add notes about this assignment" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm Transfer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
