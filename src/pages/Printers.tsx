import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Fab } from '@/components/ui/fab';
import { Plus, Search, Import } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Printer as PrinterType, PrinterStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPrinters, createPrinter } from '@/services/printers';
import { query } from '@/services/db';

interface WikiPrinter {
  id: string;
  make: string;
  model: string;
  series: string;
  specs?: Record<string, string>;
  maintenanceTips?: string;
  createdAt: string;
  updatedAt: string;
}

const getStatusColor = (status: PrinterStatus) => {
  switch (status) {
    case 'available': return 'bg-status-available text-white';
    case 'rented': return 'bg-status-rented text-black';
    case 'maintenance': return 'bg-status-maintenance text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatusEmoji = (status: PrinterStatus) => {
  switch (status) {
    case 'available': return '🟢';
    case 'rented': return '🟡';
    case 'maintenance': return '🔴';
    default: return '⚪';
  }
};

export default function Printers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [printers, setPrinters] = useState<PrinterType[]>([]);
  const [wikiPrinters, setWikiPrinters] = useState<WikiPrinter[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingWiki, setLoadingWiki] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedWikiPrinter, setSelectedWikiPrinter] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  
  useEffect(() => {
    fetchPrinters();
  }, []);
  
  const fetchPrinters = async () => {
    try {
      setLoading(true);
      const printersData = await getPrinters();
      
      // Convert MariaDB printer objects to match the Printer type from @/types
      const convertedPrinters: PrinterType[] = printersData.map(printer => ({
        id: printer.id,
        make: printer.make,
        model: printer.model,
        status: printer.status as PrinterStatus, // Cast to PrinterStatus type
        ownedBy: printer.ownedBy,
        assignedTo: printer.assignedTo || undefined,
        series: printer.series,
        department: printer.department || undefined,
        location: printer.location || undefined,
        isForRent: printer.isForRent,
        createdAt: printer.createdAt,
        updatedAt: printer.updatedAt,
        clientId: printer.clientId
      }));
      
      setPrinters(convertedPrinters);
    } catch (error) {
      console.error('Error fetching printers:', error);
      toast({
        title: "Error fetching printers",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
      
      // Fallback to mock data if database is not available
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
          isForRent: false
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
          isForRent: true
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
          isForRent: false
        },
      ];
      
      setPrinters(mockPrinters);
    } finally {
      setLoading(false);
    }
  };

  const fetchWikiPrinters = async () => {
    try {
      setLoadingWiki(true);
      
      const results = await query<any[]>('SELECT * FROM printer_wiki');
      
      const transformedWikiPrinters: WikiPrinter[] = results.map(printer => ({
        id: printer.id,
        make: printer.make,
        series: printer.series,
        model: printer.model,
        maintenanceTips: printer.maintenance_tips || undefined,
        specs: printer.specs as Record<string, string> || {},
        createdAt: printer.created_at,
        updatedAt: printer.updated_at
      }));
      
      setWikiPrinters(transformedWikiPrinters);
    } catch (error: any) {
      console.error('Error fetching wiki printers:', error);
      toast({
        title: "Error fetching wiki printers",
        description: error.message,
        variant: "destructive"
      });
      
      // Mock wiki printers if database is not available
      const mockWikiPrinters: WikiPrinter[] = [
        {
          id: 'w1',
          make: 'HP',
          series: 'LaserJet',
          model: 'Pro MFP M428fdn',
          specs: { 'print-speed': '40ppm', 'color': 'No' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'w2',
          make: 'Brother',
          series: 'MFC',
          model: 'L8900CDW',
          specs: { 'print-speed': '35ppm', 'color': 'Yes' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'w3',
          make: 'Canon',
          series: 'imageRUNNER',
          model: '1643i',
          specs: { 'print-speed': '43ppm', 'color': 'No' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      setWikiPrinters(mockWikiPrinters);
    } finally {
      setLoadingWiki(false);
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
    fetchWikiPrinters();
    setImportDialogOpen(true);
  };

  const handleImportPrinter = async () => {
    if (!selectedWikiPrinter) {
      toast({
        title: "Error",
        description: "Please select a printer to import",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedPrinter = wikiPrinters.find(p => p.id === selectedWikiPrinter);
      
      if (!selectedPrinter) {
        throw new Error("Selected printer not found in wiki");
      }

      await createPrinter({
        make: selectedPrinter.make,
        series: selectedPrinter.series,
        model: selectedPrinter.model,
        status: 'available',
        ownedBy: 'system',
        assignedTo: null,
        clientId: null,
        department: department || null,
        location: location || null,
        isForRent: false
      });

      toast({
        title: "Success",
        description: `${selectedPrinter.make} ${selectedPrinter.model} imported successfully`,
      });

      setImportDialogOpen(false);
      setSelectedWikiPrinter('');
      setDepartment('');
      setLocation('');
      
      await fetchPrinters();
    } catch (error: any) {
      console.error('Error importing printer:', error);
      toast({
        title: "Error importing printer",
        description: error.message,
        variant: "destructive"
      });
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
                  </div>
                  <Badge className={`ml-2 ${getStatusColor(printer.status as PrinterStatus)}`}>
                    {getStatusEmoji(printer.status as PrinterStatus)} {printer.status}
                  </Badge>
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleAssignPrinter(printer.id)}
                    >
                      Assign
                    </Button>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Printer Model</label>
              {loadingWiki ? (
                <div className="flex justify-center py-2">
                  <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <Select value={selectedWikiPrinter} onValueChange={setSelectedWikiPrinter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a printer model" />
                  </SelectTrigger>
                  <SelectContent>
                    {wikiPrinters.map(printer => (
                      <SelectItem key={printer.id} value={printer.id}>
                        {printer.make} {printer.series} {printer.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

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
