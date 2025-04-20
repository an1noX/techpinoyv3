import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Fab } from '@/components/ui/fab';
import { Plus, Search, Filter, Printer, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssignPrinterDialog } from '@/components/AssignPrinterDialog';
import { ClientDetailSheet } from '@/components/ClientDetailSheet';
import { Client, PrinterSummary } from '@/types';

export default function Clients() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddClientDialog, setOpenAddClientDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [openClientDetail, setOpenClientDetail] = useState(false);
  
  useEffect(() => {
    fetchClients();
  }, []);
  
  const fetchClients = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          printers:printers(id, make, model, status, location)
        `);
      
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
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleAddClient = () => {
    setOpenAddClientDialog(true);
  };

  const handleAssignPrinter = (client: Client) => {
    setSelectedClient(client);
    setOpenAssignDialog(true);
  };

  const handleViewClientDetails = (client: Client) => {
    setSelectedClient(client);
    setOpenClientDetail(true);
  };

  const handleSaveClient = async (clientData: { 
    name: string;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    notes?: string | null;
  }) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Client added successfully"
      });

      setOpenAddClientDialog(false);
      fetchClients();
    } catch (error: any) {
      toast({
        title: "Error adding client",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  return (
    <MobileLayout
      fab={
        <Fab 
          icon={<Plus size={24} />} 
          aria-label="Add client" 
          onClick={handleAddClient}
        />
      }
    >
      <div className="container px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Clients</h1>
        </div>
        
        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setSearchTerm('')}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No clients found</p>
            <Button className="mt-4" onClick={handleAddClient}>Add Client</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  {client.company && (
                    <p className="text-sm text-muted-foreground">{client.company}</p>
                  )}
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-col gap-2">
                    {client.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{client.phone}</span>
                      </div>
                    )}
                    <div className="mt-2">
                      <p className="text-sm font-medium">Assigned Printers:</p>
                      {client.printers && client.printers.length > 0 ? (
                        <div className="text-sm space-y-1 mt-1">
                          {client.printers.map((printer, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Printer className="h-4 w-4 text-muted-foreground" />
                              <span>{printer.make} {printer.model}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">No printers assigned</p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewClientDetails(client)}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleAssignPrinter(client)}
                  >
                    Assign Printer
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Client Dialog */}
      <Dialog open={openAddClientDialog} onOpenChange={setOpenAddClientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name*</label>
              <Input id="name" placeholder="Client name" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Input id="company" placeholder="Company name" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input id="email" type="email" placeholder="email@example.com" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input id="phone" placeholder="Phone number" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input id="address" placeholder="Address" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Input id="notes" placeholder="Additional notes" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAddClientDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              const nameInput = document.getElementById('name') as HTMLInputElement;
              const companyInput = document.getElementById('company') as HTMLInputElement;
              const emailInput = document.getElementById('email') as HTMLInputElement;
              const phoneInput = document.getElementById('phone') as HTMLInputElement;
              const addressInput = document.getElementById('address') as HTMLInputElement;
              const notesInput = document.getElementById('notes') as HTMLInputElement;
              
              if (!nameInput.value) {
                toast({
                  title: "Error",
                  description: "Name is required",
                  variant: "destructive"
                });
                return;
              }
              
              handleSaveClient({
                name: nameInput.value,
                company: companyInput.value || null,
                email: emailInput.value || null,
                phone: phoneInput.value || null,
                address: addressInput.value || null,
                notes: notesInput.value || null
              });
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Printer Dialog */}
      {selectedClient && (
        <AssignPrinterDialog
          open={openAssignDialog}
          onOpenChange={setOpenAssignDialog}
          client={selectedClient}
          onAssignSuccess={fetchClients}
        />
      )}

      {/* Client Detail Sheet */}
      {selectedClient && (
        <ClientDetailSheet
          open={openClientDetail}
          onOpenChange={setOpenClientDetail}
          client={selectedClient}
          onClientUpdated={fetchClients}
        />
      )}
    </MobileLayout>
  );
}
