
import React, { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Client {
  id: string;
  name: string;
  company: string | null;
}

interface ClientDropdownProps {
  currentClientId?: string | null;
  printerId: string;
  onClientAssigned: (clientId: string | null, clientName: string | null) => void;
  triggerLabel?: string;
}

export function ClientDropdown({
  currentClientId,
  printerId,
  onClientAssigned,
  triggerLabel = "Assign Client"
}: ClientDropdownProps) {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, company')
        .order('name');
      
      if (error) throw error;
      
      setClients(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching clients",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      // Set a minimum loading time to avoid flashing
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleAssignClient = async (clientId: string | null) => {
    try {
      const { error } = await supabase
        .from('printers')
        .update({ 
          client_id: clientId,
          assigned_to: clientId ? clients.find(c => c.id === clientId)?.name || null : null,
          status: clientId ? 'deployed' : 'available',
          updated_at: new Date().toISOString()
        })
        .eq('id', printerId);
      
      if (error) throw error;
      
      const selectedClient = clientId ? clients.find(c => c.id === clientId) : null;
      
      onClientAssigned(
        clientId, 
        selectedClient ? selectedClient.name : null
      );
      
      toast({
        title: "Client assignment updated",
        description: clientId 
          ? `Printer assigned to ${selectedClient?.name}`
          : "Printer unassigned",
      });
    } catch (error: any) {
      toast({
        title: "Error assigning client",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Filter clients based on search term
  const filteredClients = searchTerm
    ? clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : clients;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
          {triggerLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end">
        <DropdownMenuLabel>Clients</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5">
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[200px]">
          {loading ? (
            <DropdownMenuItem disabled>
              <div className="flex items-center">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Loading clients...
              </div>
            </DropdownMenuItem>
          ) : filteredClients.length === 0 ? (
            <DropdownMenuItem disabled>
              {searchTerm ? "No matching clients found" : "No clients found"}
            </DropdownMenuItem>
          ) : (
            <>
              {filteredClients.map(client => (
                <DropdownMenuItem
                  key={client.id}
                  className={`${client.id === currentClientId ? "bg-muted" : ""} cursor-pointer`}
                  onClick={() => handleAssignClient(client.id)}
                >
                  <div className="truncate">
                    <span className="font-medium">{client.name}</span>
                    {client.company && (
                      <span className="text-xs block text-muted-foreground truncate">
                        {client.company}
                      </span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </ScrollArea>
        
        {currentClientId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive hover:text-destructive cursor-pointer" 
              onClick={() => handleAssignClient(null)}
            >
              Unassign Client
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" asChild>
          <a href="/clients/new" className="flex items-center">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Client
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
