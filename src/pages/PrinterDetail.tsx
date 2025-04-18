
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Printer as PrinterIcon, Wrench, Clock, Calendar, User, Users, Edit, Settings, Trash, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Printer, PrinterStatus } from '@/types';
import { PrinterStatusBadge } from '@/components/PrinterStatusBadge';
import { ClientDropdown } from '@/components/ClientDropdown';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function PrinterDetail() {
  const { printerId } = useParams<{ printerId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [printer, setPrinter] = useState<Printer | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    if (printerId) {
      fetchPrinter(printerId);
    }
  }, [printerId]);

  const fetchPrinter = async (id: string) => {
    try {
      setLoading(true);
      setLoadingError(null);
      
      // Set up a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setLoadingError("Request timed out. Please try again.");
        setLoading(false);
      }, 10000); // 10 second timeout
      
      const { data, error } = await supabase
        .from('printers')
        .select('*')
        .eq('id', id)
        .single();
      
      // Clear the timeout if we got a response
      clearTimeout(timeoutId);
      
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
      setLoadingError(error.message);
      toast({
        title: "Error fetching printer",
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

  const handleRetry = () => {
    if (printerId) {
      fetchPrinter(printerId);
    }
  };

  // Render loading skeleton UI
  const renderSkeleton = () => (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mt-1" />
        </div>
        <Skeleton className="h-8 w-24" />
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
              {Array(6).fill(0).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-full mt-4" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  return (
    <MobileLayout>
      <div className="container px-4 py-4">
        <Button variant="ghost" onClick={() => navigate('/printers')} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Printers
        </Button>
        
        {loading ? (
          renderSkeleton()
        ) : loadingError ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              {loadingError}
            </p>
            <Button onClick={handleRetry}>
              Try Again
            </Button>
          </div>
        ) : !printer ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Printer not found</p>
            <Button onClick={() => navigate('/printers')} className="mt-4">
              Back to Printers
            </Button>
          </div>
        ) : (
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
                <div className="mt-2">
                  <Badge className={`${printer.ownedBy === 'system' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'} mr-2`}>
                    {printer.ownedBy === 'system' ? 'System-owned' : 'Client-owned'}
                  </Badge>
                  {printer.isForRent && (
                    <Badge className="bg-green-100 text-green-800">
                      Available for Rent
                    </Badge>
                  )}
                </div>
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
                    <div>
                      <p className="text-sm font-medium">Created At</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(printer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(printer.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <ClientDropdown
                      printerId={printer.id}
                      currentClientId={null} // Would need to modify the printer type to include clientId
                      onClientAssigned={handleClientAssigned}
                      triggerLabel={printer.assignedTo ? "Change Client" : "Assign Client"}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="activity">
                  <p className="text-sm text-muted-foreground">
                    No activity to display.
                  </p>
                </TabsContent>
                <TabsContent value="settings">
                  <div className="space-y-2">
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Danger Zone</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        These actions cannot be undone.
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Printer
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}
