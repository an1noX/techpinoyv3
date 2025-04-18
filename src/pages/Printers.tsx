import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Fab } from '@/components/ui/fab';
import { Plus, Search, Import } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PrinterStatusBadge } from '@/components/PrinterStatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Printer, PrinterStatus, PrinterModelDetails } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PrinterMakeSelect } from '@/components/PrinterMakeSelect';
import { PrinterSeriesSelect } from '@/components/PrinterSeriesSelect';
import { PrinterModelSelect } from '@/components/PrinterModelSelect';
import { ClientDropdown } from '@/components/ClientDropdown';
import { rpcGetPrinterModelDetails } from '@/integrations/supabase/client';

export default function Printers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedMakeId, setSelectedMakeId] = useState('');
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [department, setDepartment] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [isForRent, setIsForRent] = useState<boolean>(false);
  const [modelDetails, setModelDetails] = useState<PrinterModelDetails | null>(null);

  useEffect(() => {
    fetchPrinters();
  }, []);

  const fetchPrinters = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('printers')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      const transformedPrinters: Printer[] = (data || []).map(printer => ({
        id: printer.id,
        make: printer.make,
        series: printer.series,
        model: printer.model,
        status: printer.status as PrinterStatus,
        ownedBy: printer.owned_by,
        assignedTo: printer.assigned_to || undefined,
        department: printer.department || undefined,
        location: printer.location || undefined,
        createdAt: printer.created_at,
        updatedAt: printer.updated_at,
        isForRent: printer.is_for_rent || false
      }));
      
      setPrinters(transformedPrinters);
    } catch (error: any) {
      toast({
        title: "Error fetching printers",
        description: error.message,
        variant: "destructive"
      });
      
      const mockPrinters: Printer[] = [
        { 
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
        { 
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
        { 
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
      ];
      
      setPrinters(mockPrinters);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredPrinters = printers.filter(printer => 
    printer.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    printer.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    printer.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    printer.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignPrinter = async (printerId: string) => {
    navigate(`/printers/${printerId}`);
  };

  const handleOpenImportDialog = () => {
    setImportDialogOpen(true);
    setIsForRent(false); // Ensure "For Rent" is defaulted to off
  };

  const handleImportPrinter = async () => {
    if (!selectedModelId) {
      toast({
        title: "Error",
        description: "Please select a printer model",
        variant: "destructive"
      });
      return;
    }

    try {
      // Fetch the selected model details to get series and make
      const { data: modelData, error: modelError } = await rpcGetPrinterModelDetails(selectedModelId);
      
      if (modelError) throw modelError;
      if (!modelData) throw new Error("Model details not found");
      
      const modelDetails = Array.isArray(modelData) ? modelData[0] : modelData;
      
      // Insert the printer
      const { data, error } = await supabase
        .from('printers')
        .insert({
          make: modelDetails.make_name,
          series: modelDetails.series_name,
          model: modelDetails.model_name,
          status: 'available' as PrinterStatus,
          owned_by: 'system',
          department: department || null,
          location: location || null,
          is_for_rent: isForRent
        })
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: `${modelDetails.make_name} ${modelDetails.model_name} imported successfully`,
      });

      setImportDialogOpen(false);
      setSelectedMakeId('');
      setSelectedSeriesId('');
      setSelectedModelId('');
      setDepartment('');
      setLocation('');
      setIsForRent(false);
      
      await fetchPrinters();
    } catch (error: any) {
      toast({
        title: "Error importing printer",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (printerId: string, newStatus: PrinterStatus) => {
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
      setPrinters(printers.map(printer => 
        printer.id === printerId ? { ...printer, status: newStatus } : printer
      ));
      
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

  const handleClientAssigned = (printerId: string, clientId: string | null, clientName: string | null) => {
    // Update the local state
    setPrinters(printers.map(printer => 
      printer.id === printerId 
        ? { 
            ...printer, 
            assignedTo: clientName || undefined,
            status: clientId ? 'deployed' : 'available'
          } 
        : printer
    ));
  };

  const fetchModelDetails = async (modelId: string) => {
    try {
      const { data, error } = await rpcGetPrinterModelDetails(modelId);
      
      if (error) throw error;
      
      if (data) {
        setModelDetails(data);
      }
    } catch (error: any) {
      // Error handling
    }
  };

  return (
    <MobileLayout
      fab={
        <div className="flex flex-col space-y-4">
          <Fab 
            icon={<Import size={24} />} 
            aria-label="Import printer from Wiki" 
            onClick={handleOpenImportDialog}
          />
        </div>
      }
    >
      <div className="container px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Printer Fleet</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Manage actual printers in your system. New printers can only be imported from the Wiki.
        </p>
        
        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search printers..."
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
        ) : filteredPrinters.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No printers found</p>
            <Button className="mt-4" onClick={handleOpenImportDialog}>Import Printer from Wiki</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPrinters.map((printer) => (
              <Card key={printer.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{printer.make} {printer.model}</CardTitle>
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
                    onStatusChange={(newStatus) => handleStatusChange(printer.id, newStatus)}
                    clickable
                  />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 mr-2"
                      onClick={() => navigate(`/printers/${printer.id}`)}
                    >
                      Details
                    </Button>
                    <ClientDropdown
                      printerId={printer.id}
                      currentClientId={null} // Would need to modify the printer type to include clientId
                      onClientAssigned={(clientId, clientName) => handleClientAssigned(printer.id, clientId, clientName)}
                      triggerLabel={printer.assignedTo ? "Change Client" : "Assign Client"}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Printer from Wiki</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <PrinterMakeSelect
              value={selectedMakeId}
              onChange={setSelectedMakeId}
            />
            
            <PrinterSeriesSelect
              makeId={selectedMakeId}
              value={selectedSeriesId}
              onChange={setSelectedSeriesId}
              disabled={!selectedMakeId}
            />
            
            <PrinterModelSelect
              seriesId={selectedSeriesId}
              value={selectedModelId}
              onChange={setSelectedModelId}
              disabled={!selectedSeriesId}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input 
                placeholder="Marketing, Sales, IT..." 
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input 
                placeholder="Floor 2, Room 201..." 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="for-rent"
                checked={isForRent}
                onChange={(e) => setIsForRent(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="for-rent" className="text-sm font-medium">
                Available for Rent
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleImportPrinter}>Import Printer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
