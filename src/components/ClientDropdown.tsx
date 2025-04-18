
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
import { Users, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      setLoading(false);
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Users className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Clients</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <DropdownMenuItem disabled>
            <div className="flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
              Loading...
            </div>
          </DropdownMenuItem>
        ) : clients.length === 0 ? (
          <DropdownMenuItem disabled>No clients found</DropdownMenuItem>
        ) : (
          <>
            {clients.map(client => (
              <DropdownMenuItem
                key={client.id}
                className={client.id === currentClientId ? "bg-muted" : ""}
                onClick={() => handleAssignClient(client.id)}
              >
                {client.name} {client.company ? `(${client.company})` : ""}
              </DropdownMenuItem>
            ))}
            
            {currentClientId && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleAssignClient(null)}>
                  <span className="text-destructive">Unassign Client</span>
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/clients/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Client
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
