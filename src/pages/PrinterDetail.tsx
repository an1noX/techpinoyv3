import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Printer as PrinterIcon, Wrench, Clock, Calendar, User, Users, Edit, Settings, Trash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Printer, PrinterStatus } from '@/types';
import { PrinterStatusBadge } from '@/components/PrinterStatusBadge';
import { ClientDropdown } from '@/components/ClientDropdown';
import { Badge } from '@/components/ui/badge';

export default function PrinterDetail() {
  const { printerId } = useParams<{ printerId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [printer, setPrinter] = useState<Printer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (printerId) {
      fetchPrinter(printerId);
    }
  }, [printerId]);

  const fetchPrinter = async (id: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('printers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Transform the data to match the Printer type
      const transformedPrinter: Printer = {
        id: data.id,
        make: data.make,
        series: data.series,
        model: data.model,
        status: data.status as PrinterStatus,
        ownedBy: data.owned_by,
        assignedTo: data.assigned_to || undefined,
        department: data.department || undefined,
        location: data.location || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isForRent: data.is_for_rent || false
      };
      
      setPrinter(transformedPrinter);
    } catch (error: any) {
      toast({
        title: "Error fetching printer",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: PrinterStatus) => {
    if (!printerId) return;
    
    try {
      const { error } = await supabase
        .from('printers')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', printerId);
      
      if (error) throw error;
      
      // Update the local state
      setPrinter(printer => printer ? { ...printer, status: newStatus } : printer);
      
      toast({
        title: "Status updated",
        description: `Printer status changed to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleClientAssigned = (clientId: string | null, clientName: string | null) => {
    setPrinter(printer => printer ? { 
      ...printer, 
      assignedTo: clientName || undefined,
      status: clientId ? 'deployed' : 'available'
    } : printer);
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="container px-4 py-4">
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!printer) {
    return (
      <MobileLayout>
        <div className="container px-4 py-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Printer not found</p>
            <Button onClick={() => navigate('/printers')}>
              Back to Printers
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="container px-4 py-4">
        <Button variant="ghost" onClick={() => navigate('/printers')} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Printers
        </Button>
        
        <Card className="overflow-hidden">
          <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{printer.make} {printer.model}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {printer.department} • {printer.location}
              </p>
              {printer.assignedTo && (
                <p className="text-xs text-muted-foreground mt-1">
                  Assigned to: {printer.assignedTo}
                </p>
              )}
            </div>
            <PrinterStatusBadge 
              status={printer.status}
              printerId={printer.id}
              onStatusChange={handleStatusChange}
              clickable
            />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList>
                <TabsTrigger value="details">
                  <PrinterIcon className="mr-2 h-4 w-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <Clock className="mr-2 h-4 w-4" />
                  Activity
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Make</p>
                    <p className="text-sm text-muted-foreground">{printer.make}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Model</p>
                    <p className="text-sm text-muted-foreground">{printer.model}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Series</p>
                    <p className="text-sm text-muted-foreground">{printer.series}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">
                      <Badge className={`
                          ${printer.status === 'available' && 'bg-green-500 text-white'}
                          ${printer.status === 'rented' && 'bg-yellow-500 text-black'}
                          ${printer.status === 'maintenance' && 'bg-red-500 text-white'}
                          ${printer.status === 'deployed' && 'bg-blue-500 text-white'}
                        `}>
                        {printer.status}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Department</p>
                    <p className="text-sm text-muted-foreground">{printer.department || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{printer.location || 'N/A'}</p>
                  </div>
                </div>
                <ClientDropdown
                  printerId={printer.id}
                  currentClientId={null} // Would need to modify the printer type to include clientId
                  onClientAssigned={handleClientAssigned}
                  triggerLabel={printer.assignedTo ? "Change Client" : "Assign Client"}
                />
              </TabsContent>
              <TabsContent value="activity">
                <p className="text-sm text-muted-foreground">
                  No activity to display.
                </p>
              </TabsContent>
              <TabsContent value="settings">
                <div className="space-y-2">
                  <Button variant="destructive" size="sm">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Printer
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
