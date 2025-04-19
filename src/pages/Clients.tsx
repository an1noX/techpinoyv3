import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Fab } from '@/components/ui/fab';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientDetailSheet } from '@/components/ClientDetailSheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getClients, createClient, getClientWithPrinters, Client } from '@/services/clients';
import { useToast } from '@/hooks/use-toast';
import { Printer } from '@/types';

export default function Clients() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientPrinters, setClientPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  
  useEffect(() => {
    fetchClients();
  }, []);
  
  const fetchClients = async () => {
    try {
      setLoading(true);
      const clientsData = await getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error fetching clients",
        description: error instanceof Error ? error.message : 'Unknown error',
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
  
  const handleOpenDetail = async (client: Client) => {
    try {
      setSelectedClient(client);
      
      // Fetch client with their printers
      const clientWithPrinters = await getClientWithPrinters(client.id);
      setSelectedClient(clientWithPrinters.client);
      setClientPrinters(clientWithPrinters.printers);
      
      setIsDetailOpen(true);
    } catch (error) {
      console.error('Error fetching client details:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to load client details',
        variant: "destructive"
      });
    }
  };
  
  const handleCreateClient = async () => {
    try {
      if (!newClient.name) {
        toast({
          title: "Error",
          description: "Client name is required",
          variant: "destructive"
        });
        return;
      }
      
      const created = await createClient({
        name: newClient.name,
        company: newClient.company || null,
        email: newClient.email || null,
        phone: newClient.phone || null,
        address: newClient.address || null,
        notes: newClient.notes || null
      });
      
      toast({
        title: "Success",
        description: `Client ${created.name} created successfully`,
      });
      
      setIsCreateDialogOpen(false);
      setNewClient({
        name: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
      });
      
      // Refresh clients list
      await fetchClients();
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Error creating client",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };
  
  const handleClientDetailClose = () => {
    setIsDetailOpen(false);
    setSelectedClient(null);
    setClientPrinters([]);
  };
  
  return (
    <MobileLayout
      fab={
        <Fab icon={<Plus size={24} />} aria-label="Add client" onClick={() => setIsCreateDialogOpen(true)} />
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
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7h18" />
              <path d="M6 12h12" />
              <path d="M9 17h6" />
            </svg>
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No clients found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    {client.company}
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => handleOpenDetail(client)}>
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <ClientDetailSheet
        open={isDetailOpen}
        onOpenChange={handleClientDetailClose}
        client={selectedClient}
        printers={clientPrinters}
      />
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                placeholder="Client Name" 
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input 
                id="company" 
                placeholder="Company Name" 
                value={newClient.company}
                onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="Email Address" 
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                placeholder="Phone Number" 
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                placeholder="Street Address" 
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Additional Notes" 
                value={newClient.notes}
                onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateClient}>Create Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
