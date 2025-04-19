
import React, { useState, useEffect } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Printer, Mail, Phone, MapPin, Building, ClipboardList, Calendar } from 'lucide-react';

interface ClientDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: any;
  onClientUpdated: () => void;
}

export function ClientDetailSheet({ 
  open, 
  onOpenChange, 
  client,
  onClientUpdated
}: ClientDetailSheetProps) {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(client?.name || '');
  const [company, setCompany] = useState(client?.company || '');
  const [email, setEmail] = useState(client?.email || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [address, setAddress] = useState(client?.address || '');
  const [notes, setNotes] = useState(client?.notes || '');
  const [printerAssignments, setPrinterAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (open && client?.id) {
      fetchPrinterAssignmentHistory();
    }
  }, [open, client?.id]);

  useEffect(() => {
    // Update form values when client changes
    if (client) {
      setName(client.name || '');
      setCompany(client.company || '');
      setEmail(client.email || '');
      setPhone(client.phone || '');
      setAddress(client.address || '');
      setNotes(client.notes || '');
    }
  }, [client]);

  const fetchPrinterAssignmentHistory = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('printer_client_assignments')
        .select(`
          *,
          printer:printers(id, make, model, series)
        `)
        .eq('client_id', client.id)
        .order('assigned_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setPrinterAssignments(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching assignment history",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!name.trim()) {
        toast({
          title: "Error",
          description: "Name is required",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('clients')
        .update({
          name,
          company: company || null,
          email: email || null,
          phone: phone || null,
          address: address || null,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', client.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Client information updated successfully"
      });

      setEditMode(false);
      onClientUpdated();
    } catch (error: any) {
      toast({
        title: "Error updating client",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleUnassignPrinter = async (printerId: string, assignmentId: string) => {
    try {
      // Update the printer status
      const { error: printerError } = await supabase
        .from('printers')
        .update({ 
          status: 'available', 
          assigned_to: null,
          client_id: null
        })
        .eq('id', printerId);

      if (printerError) {
        throw printerError;
      }

      // Update the assignment record
      const { error: assignmentError } = await supabase
        .from('printer_client_assignments')
        .update({
          unassigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', assignmentId);

      if (assignmentError) {
        throw assignmentError;
      }

      toast({
        title: "Success",
        description: "Printer unassigned successfully",
      });

      fetchPrinterAssignmentHistory();
      onClientUpdated();
    } catch (error: any) {
      toast({
        title: "Error unassigning printer",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{editMode ? 'Edit Client' : client?.name}</SheetTitle>
          {!editMode && client?.company && (
            <SheetDescription>{client.company}</SheetDescription>
          )}
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">Printer History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            {editMode ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name*</label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Client name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company</label>
                  <Input 
                    value={company} 
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Address"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  {client?.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  
                  {client?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  
                  {client?.address && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span>{client.address}</span>
                    </div>
                  )}
                </div>
                
                {client?.notes && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Notes
                    </h3>
                    <p className="text-sm text-muted-foreground">{client.notes}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Printer className="h-4 w-4 mr-2" />
                    Current Printers
                  </h3>
                  {client?.printers && client.printers.length > 0 ? (
                    <ul className="text-sm space-y-2">
                      {client.printers.map((printer: any, index: number) => (
                        <li key={index} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <span className="font-medium">{printer.make} {printer.model}</span>
                            <p className="text-xs text-muted-foreground">
                              Status: <span className="capitalize">{printer.status}</span>
                              {printer.location && ` • Location: ${printer.location}`}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Find the assignment record for this printer
                              const assignment = printerAssignments.find(
                                a => a.printer?.id === printer.id && !a.unassigned_at
                              );
                              if (assignment) {
                                handleUnassignPrinter(printer.id, assignment.id);
                              }
                            }}
                          >
                            Unassign
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No printers currently assigned</p>
                  )}
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button onClick={() => setEditMode(true)}>Edit Client</Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <h3 className="text-sm font-medium mb-3">Printer Assignment History</h3>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : printerAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assignment history found</p>
            ) : (
              <div className="border rounded overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Printer</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Returned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {printerAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {assignment.printer?.make} {assignment.printer?.model}
                        </TableCell>
                        <TableCell>{formatDate(assignment.assigned_at)}</TableCell>
                        <TableCell>
                          {assignment.unassigned_at 
                            ? formatDate(assignment.unassigned_at)
                            : <span className="text-green-600 font-medium">Active</span>
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
