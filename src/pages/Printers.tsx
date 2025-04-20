import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Fab } from '@/components/ui/fab';
import { Import, Search, ArrowUpDown, Printer, FileText, Wrench, Check, Info, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer as PrinterType, PrinterStatus, OwnershipType } from '@/types/printers';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ImportPrinterDialog } from '@/components/ImportPrinterDialog';
import { PrinterTransferDialog } from '@/components/PrinterTransferDialog';
import { MaintenanceQuickUpdateDialog } from '@/components/printers/MaintenanceQuickUpdateDialog';
import { GenerateServiceReportDialog } from '@/components/printers/GenerateServiceReportDialog';
import { MarkRepairedDialog } from '@/components/printers/MarkRepairedDialog';
import { PrinterDetailsDialog } from '@/components/printers/PrinterDetailsDialog';
import { PrinterHistoryDialog } from '@/components/printers/PrinterHistoryDialog';
import { PrinterStatusBadge } from '@/components/printers/PrinterStatus';
import { UpdatePrinterStatusDialog } from '@/components/printers/UpdatePrinterStatusDialog';

const toOwnershipType = (val: any): OwnershipType =>
  val === 'system' ? 'system' : 'client';

const toPrinterStatus = (val: any): PrinterStatus => {
  const allowed: PrinterStatus[] = [
    'available', 'rented', 'maintenance', 'for_repair', 'deployed'
  ];
  return allowed.includes(val as PrinterStatus) ? (val as PrinterStatus) : 'available';
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
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const [printerStatusDialogOpen, setPrinterStatusDialogOpen] = useState(false);
  const [serviceReportDialogOpen, setServiceReportDialogOpen] = useState(false);
  const [markRepairedDialogOpen, setMarkRepairedDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  const handleToggleForRent = async (printer: PrinterType, value: boolean) => {
    try {
      const { error } = await supabase
        .from('printers')
        .update({ is_for_rent: value, updated_at: new Date().toISOString() })
        .eq('id', printer.id);

      if (error) throw error;

      toast({
        title: value ? "Marked as For Rent" : "Removed from Rental List",
        description: `${printer.make} ${printer.model} is now ${value ? "available for rent" : "not for rent"}.`
      });
      fetchPrinters();
    } catch (error: any) {
      toast({
        title: "Error updating For Rent status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

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

      const typedPrinters = data?.map((printer: any) => ({
        ...printer,
        owned_by: toOwnershipType(printer.owned_by),
        status: toPrinterStatus(printer.status),
        is_for_rent: !!printer.is_for_rent,
      })) as PrinterType[];

      setPrinters(typedPrinters);
    } catch (error: any) {
      toast({
        title: "Error fetching printers",
        description: error.message,
        variant: "destructive"
      });

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

  const openPrinterStatusDialog = (printer: PrinterType) => {
    setSelectedPrinter(printer);
    setPrinterStatusDialogOpen(true);
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

  const getAssignTransferLabel = (printer: PrinterType) => {
    if (!printer.assigned_to && !printer.client_id && printer.owned_by === "system")
      return "Assign";
    return "Transfer";
  };

  const forRentToggleEnabled = (printer: PrinterType) =>
    printer.status === "available" && printer.owned_by === "system";

  const getOwnershipLabel = (printer: PrinterType) =>
    printer.owned_by === "client" ? "Client Owned" : "System Unit";

  const getClientDisplay = (printer: PrinterType) =>
    printer.owned_by === "client" && printer.assigned_to ? `(${printer.assigned_to})` : "";

  const getTonerName = (printer: PrinterType) => "TONER NAME";

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
                <CardHeader className="p-4 pb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex flex-col sm:flex-row sm:items-center gap-0.5">
                      <span>
                        {printer.make} {printer.model} {getClientDisplay(printer)}
                      </span>
                      <span className="text-xs ml-2 px-2 py-1 rounded bg-gray-100 text-gray-600 font-normal">
                        {getOwnershipLabel(printer)}
                      </span>
                    </CardTitle>
                    <div className="mt-1 flex gap-4 items-center flex-wrap">
                      <span className="text-xs text-muted-foreground font-semibold">{getTonerName(printer)}</span>
                      {printer.department && (
                        <span className="text-xs font-medium capitalize text-gray-800">{printer.department}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {printer.location && (
                        <span className="mr-2">Location: <span className="font-medium text-gray-900">{printer.location}</span></span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 min-w-fit">
                    <div className="flex items-center mb-1">
                      <div className="mr-2 flex items-center">
                        <button
                          className={`relative w-9 h-5 focus:outline-none rounded-full border ${forRentToggleEnabled(printer) ? (printer.is_for_rent ? 'bg-green-500 border-green-500' : 'bg-gray-200 border-gray-200') : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'}`}
                          style={{ transition: 'background 0.2s' }}
                          disabled={!forRentToggleEnabled(printer)}
                          aria-pressed={printer.is_for_rent}
                          onClick={() => {
                            if (forRentToggleEnabled(printer)) {
                              handleToggleForRent(printer, !printer.is_for_rent);
                            }
                          }}
                          tabIndex={forRentToggleEnabled(printer) ? 0 : -1}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full shadow transition-transform bg-white ${printer.is_for_rent ? 'translate-x-4' : ''}`}
                          ></span>
                        </button>
                      </div>
                      <PrinterStatusBadge status={printer.status} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="flex flex-wrap gap-2 mt-2 justify-between">
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
                        onClick={() => openPrinterStatusDialog(printer)}
                      >
                        <Wrench className="h-4 w-4" />
                        Update Status
                      </Button>
                      {!printer.client_id ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => {
                            setSelectedPrinter(printer);
                            setAssignDialogOpen(true);
                          }}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                          Assign
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => {
                            setSelectedPrinter(printer);
                            setTransferDialogOpen(true);
                          }}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                          Transfer
                        </Button>
                      )}
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

      {selectedPrinter && (
        <>
          <UpdatePrinterStatusDialog
            open={printerStatusDialogOpen}
            onOpenChange={(open) => {
              setPrinterStatusDialogOpen(open);
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
          <AssignPrinterDialog
            open={assignDialogOpen}
            onOpenChange={(open) => {
              setAssignDialogOpen(open);
              if (!open) setSelectedPrinter(null);
              if (!open) fetchPrinters();
            }}
            printer={selectedPrinter}
            onSuccess={fetchPrinters}
          />
          <TransferPrinterDialog
            open={transferDialogOpen}
            onOpenChange={(open) => {
              setTransferDialogOpen(open);
              if (!open) setSelectedPrinter(null);
              if (!open) fetchPrinters();
            }}
            printer={selectedPrinter}
            onSuccess={fetchPrinters}
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
