import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Printer, UserRole } from '@/types/types';
import { useAuth } from '@/hooks/useAuth';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wrench, Search, RefreshCw, PlusCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export function TechnicianAssignmentManager() {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>('');
  const isAdmin = hasRole('admin');

  useEffect(() => {
    if (isAdmin) {
      fetchTechnicians();
      fetchPrinters();
    }
  }, [isAdmin]);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .eq('role', 'technician');

      if (error) throw error;

      setTechnicians(data || []);
    } catch (error: any) {
      console.error('Error fetching technicians:', error);
      toast({
        title: 'Error fetching technicians',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPrinters = async () => {
    try {
      const { data, error } = await supabase
        .from('printers')
        .select('*');

      if (error) throw error;

      // Convert raw data to Printer type
      const typedPrinters = data?.map(printer => ({
        ...printer,
        status: printer.status as any, // Type assertion to avoid conversion issues
        owned_by: printer.owned_by as any
      })) as Printer[];

      setPrinters(typedPrinters);
    } catch (error: any) {
      toast({
        title: 'Error fetching printers',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const assignPrinterToTechnician = async () => {
    if (!selectedTechnicianId || !selectedPrinterId) {
      toast({
        title: 'Missing information',
        description: 'Please select both a technician and a printer',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Check if assignment already exists
      const { data: existingAssignment, error: checkError } = await supabase
        .from('user_printer_assignments')
        .select('*')
        .eq('user_id', selectedTechnicianId)
        .eq('printer_id', selectedPrinterId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingAssignment) {
        toast({
          title: 'Already assigned',
          description: 'This printer is already assigned to this technician',
          variant: 'destructive'
        });
        return;
      }

      // Create new assignment
      const { error } = await supabase
        .from('user_printer_assignments')
        .insert([
          { 
            user_id: selectedTechnicianId, 
            printer_id: selectedPrinterId 
          }
        ]);

      if (error) throw error;

      toast({
        title: 'Printer assigned',
        description: 'Printer has been successfully assigned to the technician',
      });

      setAssignDialogOpen(false);
      setSelectedPrinterId('');
      setSelectedTechnicianId('');
    } catch (error: any) {
      toast({
        title: 'Error assigning printer',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getTechnicianName = (technicianId: string) => {
    const technician = technicians.find(t => t.id === technicianId);
    return technician ? `${technician.first_name} ${technician.last_name}` : 'Unknown';
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredTechnicians = technicians.filter(technician =>
    `${technician.first_name} ${technician.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrinters = printers.filter(printer =>
    `${printer.make} ${printer.model}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Technician Printer Assignments
        </CardTitle>
        <CardDescription>
          Assign printers to technicians to grant them management permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-6 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search technicians or printers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchTechnicians}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 mb-4">
              <Button onClick={() => setAssignDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Assign Printer to Technician
              </Button>
            </div>

            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Printer to Technician</DialogTitle>
                  <DialogDescription>
                    Select a technician and a printer to create an assignment.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Technician
                    </label>
                    <Select value={selectedTechnicianId} onValueChange={setSelectedTechnicianId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a technician" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredTechnicians.map(technician => (
                          <SelectItem key={technician.id} value={technician.id}>
                            {technician.first_name} {technician.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Printer
                    </label>
                    <Select value={selectedPrinterId} onValueChange={setSelectedPrinterId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a printer" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredPrinters.map(printer => (
                          <SelectItem key={printer.id} value={printer.id}>
                            {printer.make} {printer.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setAssignDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={assignPrinterToTechnician}>Assign Printer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {technicians.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No technicians found</p>
            ) : printers.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No printers found</p>
            ) : (
              <div className="space-y-4">
                {technicians.map(technician => (
                  <div key={technician.id} className="p-4 border rounded">
                    <div className="font-medium">
                      {technician.first_name} {technician.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Assigned Printers:
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {printers.filter(printer => printer.assigned_to === technician.id).length > 0 ? (
                        printers.filter(printer => printer.assigned_to === technician.id).map(printer => (
                          <Button key={printer.id} variant="outline" size="sm">
                            {printer.make} {printer.model}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="ml-2 -mr-1 text-red-500 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Remove assignment logic here
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </Button>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No printers assigned</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
