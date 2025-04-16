import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Edit, Share2, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, PrinterStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';

export default function PrinterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [printer, setPrinter] = useState<Printer | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchPrinter(id);
    }
  }, [id]);
  
  const fetchPrinter = async (printerId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('printers')
        .select('*')
        .eq('id', printerId)
        .single();
      
      if (error) {
        throw error;
      }
      
      setPrinter(data);
    } catch (error: any) {
      toast({
        title: "Error fetching printer details",
        description: error.message,
        variant: "destructive"
      });
      
      // Fallback to mock data if database isn't set up
      const mockPrinters: Record<string, Printer> = {
        '1': { 
          id: '1', 
          make: 'HP', 
          series: 'LaserJet', 
          model: 'Pro MFP M428fdn',
          status: 'available',
          ownedBy: 'system',
          department: 'Marketing',
          location: 'Floor 2, Room 201',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        '2': { 
          id: '2', 
          make: 'Brother', 
          series: 'MFC', 
          model: 'L8900CDW',
          status: 'rented',
          ownedBy: 'system',
          assignedTo: 'Acme Corp',
          department: 'Sales',
          location: 'Floor 1, Room 105',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        '3': { 
          id: '3', 
          make: 'Canon', 
          series: 'imageRUNNER', 
          model: '1643i',
          status: 'maintenance',
          ownedBy: 'client',
          assignedTo: 'TechSolutions Inc',
          department: 'IT',
          location: 'Floor 3, Room 302',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      
      if (printerId in mockPrinters) {
        setPrinter(mockPrinters[printerId]);
      } else {
        setPrinter(null);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangeStatus = async (status: PrinterStatus) => {
    if (!printer) return;
    
    try {
      const { error } = await supabase
        .from('printers')
        .update({ status, updatedAt: new Date().toISOString() })
        .eq('id', printer.id);
      
      if (error) {
        throw error;
      }
      
      setPrinter({
        ...printer,
        status,
        updatedAt: new Date().toISOString()
      });
      
      toast({
        title: "Status updated",
        description: `Printer status changed to ${status}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleDeletePrinter = async () => {
    if (!printer) return;
    
    try {
      const { error } = await supabase
        .from('printers')
        .delete()
        .eq('id', printer.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Printer deleted",
        description: "The printer has been removed from the inventory",
      });
      
      navigate('/printers');
    } catch (error: any) {
      toast({
        title: "Error deleting printer",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  if (loading) {
    return (
      <MobileLayout>
        <div className="container px-4 py-4 flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MobileLayout>
    );
  }
  
  if (!printer) {
    return (
      <MobileLayout>
        <div className="container px-4 py-4 text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-status-maintenance mb-4" />
          <h1 className="text-2xl font-bold">Printer Not Found</h1>
          <p className="text-muted-foreground mb-6">The requested printer could not be found.</p>
          <Button onClick={() => navigate('/printers')}>
            Back to Printers
          </Button>
        </div>
      </MobileLayout>
    );
  }
  
  return (
    <MobileLayout>
      <div className="container px-4 py-4">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 flex items-center"
          onClick={() => navigate('/printers')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{printer.make} {printer.model}</h1>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={() => {
              // Share functionality would go here
              toast({
                title: "Share feature",
                description: "This feature will be implemented soon",
              });
            }}>
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate(`/printers/${printer.id}/edit`)}>
              <Edit className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <Badge className={`mb-4 ${getStatusColor(printer.status)}`}>
          {getStatusEmoji(printer.status)} {printer.status}
        </Badge>
        
        <Tabs defaultValue="details" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="toners">Toners</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Printer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center">
                    <Info className="h-5 w-5 mr-2 text-muted-foreground" />
                    <h3 className="font-medium">General Information</h3>
                  </div>
                  <Separator className="my-2" />
                  <div className="pl-7 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Make</span>
                      <span className="text-sm font-medium">{printer.make}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Series</span>
                      <span className="text-sm font-medium">{printer.series}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Model</span>
                      <span className="text-sm font-medium">{printer.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Owner</span>
                      <span className="text-sm font-medium capitalize">{printer.ownedBy}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-muted-foreground">
                      <path d="M20 10V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
                      <path d="M20 14v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" />
                      <path d="M12 12H4v4a4 4 0 0 0 4 4h12" />
                      <path d="M2 12h20" />
                    </svg>
                    <h3 className="font-medium">Location</h3>
                  </div>
                  <Separator className="my-2" />
                  <div className="pl-7 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Department</span>
                      <span className="text-sm font-medium">{printer.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Location</span>
                      <span className="text-sm font-medium">{printer.location}</span>
                    </div>
                    {printer.assignedTo && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Assigned To</span>
                        <span className="text-sm font-medium">{printer.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <div className="flex-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full">Change Status</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Printer Status</DialogTitle>
                          <DialogDescription>
                            Select a new status for this printer
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-4 py-4">
                          <Button
                            className={`justify-start ${printer.status === 'available' ? 'border-2 border-primary' : ''}`}
                            variant={printer.status === 'available' ? 'default' : 'outline'}
                            onClick={() => handleChangeStatus('available')}
                          >
                            <span className="mr-2">🟢</span> Available
                          </Button>
                          <Button
                            className={`justify-start ${printer.status === 'rented' ? 'border-2 border-primary' : ''}`}
                            variant={printer.status === 'rented' ? 'default' : 'outline'}
                            onClick={() => handleChangeStatus('rented')}
                          >
                            <span className="mr-2">🟡</span> Rented
                          </Button>
                          <Button
                            className={`justify-start ${printer.status === 'maintenance' ? 'border-2 border-primary' : ''}`}
                            variant={printer.status === 'maintenance' ? 'default' : 'outline'}
                            onClick={() => handleChangeStatus('maintenance')}
                          >
                            <span className="mr-2">🔴</span> Maintenance
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {printer.status === 'available' && (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        toast({
                          title: "Rent feature",
                          description: "This feature will be implemented soon",
                        });
                      }}
                    >
                      Rent Out
                    </Button>
                  )}
                </div>
                
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full mt-4">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Printer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this printer? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDeletePrinter}>
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="toners" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Compatible Toners</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Compatible toner cartridges for this printer model.
                </p>
                
                <div className="space-y-4">
                  {['Black', 'Cyan', 'Magenta', 'Yellow'].map((color) => (
                    <div key={color} className="border rounded-md p-3">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{color}</span>
                        <Badge variant="outline">In Stock: 12</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{printer.make} {color.charAt(0)}{color === 'Black' ? 'K' : color.charAt(1)}-120 Toner</p>
                      <p className="text-xs text-muted-foreground">
                        Page Yield: 2,000 pages
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Service History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-border ml-4"></div>
                  <div className="space-y-6 pl-10 relative">
                    {[
                      { date: '2023-04-01', action: 'Regular Maintenance', note: 'Cleaned printheads and replaced paper tray' },
                      { date: '2023-02-15', action: 'Toner Replacement', note: 'Replaced Cyan toner cartridge' },
                      { date: '2023-01-10', action: 'Initial Setup', note: 'Printer installed and configured' },
                    ].map((event, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-10 mt-1.5 w-4 h-4 rounded-full bg-primary"></div>
                        <h4 className="font-medium mb-1">{event.action}</h4>
                        <p className="text-sm text-muted-foreground mb-1">{new Date(event.date).toLocaleDateString()}</p>
                        <p className="text-sm">{event.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
