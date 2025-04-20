
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { EditIcon, Trash2Icon, PlusIcon, Save, XCircle } from 'lucide-react';
import { Client, PrinterSummary } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface ClientDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
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
  const [departments, setDepartments] = useState<string[]>([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [addingDepartment, setAddingDepartment] = useState(false);
  const [formData, setFormData] = useState({
    name: client.name,
    company: client.company || '',
    email: client.email || '',
    phone: client.phone || '',
    address: client.address || '',
    notes: client.notes || ''
  });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        company: client.company || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        notes: client.notes || ''
      });
      
      // Extract departments from printers
      if (client.printers) {
        const depts = client.printers
          .map(printer => printer.location || '')
          .filter(loc => loc.trim() !== '');
        
        setDepartments([...new Set(depts)]);
      }
    }
  }, [client]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveClient = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Client name is required",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('clients')
        .update({
          name: formData.name,
          company: formData.company || null,
          email: formData.email || null,
          phone: formData.phone || null,
          address: formData.address || null,
          notes: formData.notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', client.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Client updated successfully"
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

  const handleAddDepartment = async () => {
    try {
      if (!newDepartment.trim()) {
        toast({
          title: "Validation Error",
          description: "Department name is required",
          variant: "destructive"
        });
        return;
      }

      // In a real application, we would update the assigned printers or create a departments table
      // For this demo, we'll just add it to our local state
      setDepartments(prev => [...prev, newDepartment]);
      setNewDepartment('');
      setAddingDepartment(false);
      
      toast({
        title: "Success",
        description: "Department added successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error adding department",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteClient = async () => {
    try {
      // Check if client has assigned printers
      if (client.printers && client.printers.length > 0) {
        // Get all printer IDs
        const printerIds = client.printers.map(printer => printer.id);
        
        // Update all printers to remove the client
        const { error: updateError } = await supabase
          .from('printers')
          .update({
            client_id: null,
            assigned_to: null,
            status: 'available',
            updated_at: new Date().toISOString()
          })
          .in('id', printerIds);
        
        if (updateError) {
          throw updateError;
        }
        
        // Delete any printer assignments
        const { error: assignmentError } = await supabase
          .from('printer_client_assignments')
          .delete()
          .eq('client_id', client.id);
        
        if (assignmentError) {
          throw assignmentError;
        }
      }
      
      // Delete the client
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Client deleted successfully"
      });
      
      onOpenChange(false);
      onClientUpdated();
    } catch (error: any) {
      toast({
        title: "Error deleting client",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setConfirmDeleteOpen(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex justify-between items-center">
              {editMode ? 'Edit Client' : 'Client Details'}
              <div className="flex space-x-2">
                {editMode ? (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setFormData({
                          name: client.name,
                          company: client.company || '',
                          email: client.email || '',
                          phone: client.phone || '',
                          address: client.address || '',
                          notes: client.notes || ''
                        });
                        setEditMode(false);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="icon"
                      onClick={handleSaveClient}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditMode(true)}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => setConfirmDeleteOpen(true)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6">
            {editMode ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name*</label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Client name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company</label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Physical address"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Additional notes"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p className="text-base">{client.name}</p>
                </div>
                
                {client.company && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Company</h3>
                    <p className="text-base">{client.company}</p>
                  </div>
                )}
                
                {client.email && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p className="text-base">{client.email}</p>
                  </div>
                )}
                
                {client.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                    <p className="text-base">{client.phone}</p>
                  </div>
                )}
                
                {client.address && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                    <p className="text-base">{client.address}</p>
                  </div>
                )}
                
                {client.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                    <p className="text-base">{client.notes}</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-medium">Departments/Locations</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddingDepartment(true)}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              {addingDepartment ? (
                <div className="flex items-center mb-3 space-x-2">
                  <Input
                    placeholder="Department name"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleAddDepartment}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setAddingDepartment(false);
                    setNewDepartment('');
                  }}>Cancel</Button>
                </div>
              ) : null}
              
              {departments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No departments/locations found</p>
              ) : (
                <div className="space-y-2">
                  {departments.map((dept, index) => (
                    <Card key={index}>
                      <CardContent className="p-3 flex justify-between items-center">
                        <span>{dept}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-base font-medium mb-3">Assigned Printers</h3>
              {!client.printers || client.printers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No printers assigned</p>
              ) : (
                <div className="space-y-2">
                  {client.printers.map((printer, index) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{printer.make} {printer.model}</p>
                            <p className="text-sm text-muted-foreground">{printer.location}</p>
                          </div>
                          <Badge className={printer.status === 'available' ? 'bg-green-500' : printer.status === 'maintenance' ? 'bg-red-500' : 'bg-yellow-500'}>
                            {printer.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this client? This action cannot be undone.</p>
            {client.printers && client.printers.length > 0 && (
              <p className="mt-2 text-amber-600">
                Warning: This client has {client.printers.length} printer(s) assigned to them. 
                Deleting this client will unassign all printers.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteClient}>Delete Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
