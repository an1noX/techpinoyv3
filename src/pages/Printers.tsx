
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Fab } from '@/components/ui/fab';
import { Import, Search, ArrowUpDown, Printer, FileText, Wrench, Check, Info, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer as PrinterType, PrinterStatus, OwnershipType } from '@/types/printers';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ImportPrinterDialog } from '@/components/ImportPrinterDialog';
import { PrinterTransferDialog } from '@/components/PrinterTransferDialog';
// Import modal dialogs from Maintenance section
import { MaintenanceQuickUpdateDialog } from '@/components/printers/MaintenanceQuickUpdateDialog';
import { GenerateServiceReportDialog } from '@/components/printers/GenerateServiceReportDialog';
import { MarkRepairedDialog } from '@/components/printers/MarkRepairedDialog';
import { PrinterDetailsDialog } from '@/components/printers/PrinterDetailsDialog';
import { PrinterHistoryDialog } from '@/components/printers/PrinterHistoryDialog';

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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterType | null>(null);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  // State for new unified modal dialogs
  const [quickUpdateDialogOpen, setQuickUpdateDialogOpen] = useState(false);
  const [serviceReportDialogOpen, setServiceReportDialogOpen] = useState(false);
  const [markRepairedDialogOpen, setMarkRepairedDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

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

      // Convert string owned_by to OwnershipType
      const typedPrinters = data?.map(printer => ({
        ...printer,
        owned_by: printer.owned_by as OwnershipType
      })) as PrinterType[];

      setPrinters(typedPrinters);
    } catch (error: any) {
      toast({
        title: "Error fetching printers",
        description: error.message,
        variant: "destructive"
      });

      // Mock data for development
      const mockPrinters: PrinterType[] = [
        { 
          id: '1', 
          make: 'HP', 
          series: 'LaserJet', 
          model: 'Pro MFP M428fdn',
          status: 'available',
          owned_by: 'system',
          department: 'Marketing',
          location: 'Floor 2, Room 201',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_for_rent: false,
        },
        { 
          id: '2', 
          make: 'Brother', 
          series: 'MFC', 
          model: 'L8900CDW',
          status: 'rented',
          owned_by: 'system',
          assigned_to: 'Acme Corp',
          department: 'Sales',
          location: 'Floor 1, Room 105',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_for_rent: false,
        },
        { 
          id: '3', 
          make: 'Canon', 
          series: 'imageRUNNER', 
          model: '1643i',
          status: 'maintenance',
          owned_by: 'client',
          assigned_to: 'TechSolutions Inc',
          department: 'IT',
          location: 'Floor 3, Room 302',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_for_rent: false,
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

  const handleOpenImportDialog = () => {
    setImportDialogOpen(true);
  };

  const handleOpenTransferDialog = (printer: PrinterType) => {
    setSelectedPrinter(printer);
    setTransferDialogOpen(true);
  };

  // Handlers for unified modals
  const openQuickUpdateDialog = (printer: PrinterType) => {
    setSelectedPrinter(printer);
    setQuickUpdateDialogOpen(true);
  };
  const openServiceReportDialog = (printer: PrinterType) => {
    setSelectedPrinter(printer);
    setServiceReportDialogOpen(true);
  };
  const openMarkRepairedDialog = (printer: PrinterType) => {
    setSelectedPrinter(printer);
    setMarkRepairedDialogOpen(true);
  };
  const openDetailsDialog = (printer: PrinterType) => {
    setSelectedPrinter(printer);
    setDetailsDialogOpen(true);
  };
  const openHistoryDialog = (printer: PrinterType) => {
    setSelectedPrinter(printer);
    setHistoryDialogOpen(true);
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
                      {printer.department || printer.assigned_to} • {printer.location}
                    </p>
                  </div>
                  <Badge className={`ml-2 ${getStatusColor(printer.status)}`}>
                    {getStatusEmoji(printer.status)} {printer.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-2 mt-2 justify-between">
                    {/* Unified button set, styled and ordered as in Maintenance module */}
                    <div className="flex gap-2 flex-wrap w-full">
                      <Button 
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => openDetailsDialog(printer)}
                      >
                        <Info className="h-4 w-4" />
                        Details
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => openQuickUpdateDialog(printer)}
                      >
                        <Wrench className="h-4 w-4" />
                        Quick Update
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => openServiceReportDialog(printer)}
                      >
                        <FileText className="h-4 w-4" />
                        Generate Report
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => openMarkRepairedDialog(printer)}
                      >
                        <Check className="h-4 w-4" />
                        Repaired
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => handleOpenTransferDialog(printer)}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                        Transfers
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => openHistoryDialog(printer)}
                      >
                        <History className="h-4 w-4" />
                        History
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Unified dialogs for Inventory actions (reuse Maintenance dialogs) */}
      {selectedPrinter && (
        <>
          <MaintenanceQuickUpdateDialog
            open={quickUpdateDialogOpen}
            onOpenChange={(open) => {
              setQuickUpdateDialogOpen(open);
              if (!open) setSelectedPrinter(null);
              if (!open) fetchPrinters();
            }}
            printer={selectedPrinter}
            onSuccess={fetchPrinters}
          />
          <GenerateServiceReportDialog
            open={serviceReportDialogOpen}
            onOpenChange={(open) => {
              setServiceReportDialogOpen(open);
              if (!open) setSelectedPrinter(null);
              if (!open) fetchPrinters();
            }}
            printer={selectedPrinter}
            onSuccess={fetchPrinters}
          />
          <MarkRepairedDialog
            open={markRepairedDialogOpen}
            onOpenChange={(open) => {
              setMarkRepairedDialogOpen(open);
              if (!open) setSelectedPrinter(null);
              if (!open) fetchPrinters();
            }}
            printer={selectedPrinter}
            onSuccess={fetchPrinters}
          />
          <PrinterDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={(open) => {
              setDetailsDialogOpen(open);
              if (!open) setSelectedPrinter(null);
            }}
            printer={selectedPrinter}
          />
          <PrinterHistoryDialog
            open={historyDialogOpen}
            onOpenChange={(open) => {
              setHistoryDialogOpen(open);
              if (!open) setSelectedPrinter(null);
            }}
            printer={selectedPrinter}
          />
          <PrinterTransferDialog
            open={transferDialogOpen}
            onOpenChange={(open) => {
              setTransferDialogOpen(open);
              if (!open) setSelectedPrinter(null);
            }}
            printer={selectedPrinter}
            onTransferSuccess={fetchPrinters}
          />
        </>
      )}

      <ImportPrinterDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportSuccess={fetchPrinters}
      />
    </MobileLayout>
  );
}
