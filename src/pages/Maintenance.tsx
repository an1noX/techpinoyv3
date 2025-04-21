
import React, { useState } from "react";
import { Printer, MaintenanceStatus, PrinterStatus } from "@/types/printers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, Printer as PrinterIcon, FileText, Check, Info, History, Plus } from "lucide-react";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { MaintenanceQuickUpdateDialog } from "@/components/printers/MaintenanceQuickUpdateDialog";
import { usePrintersWithStatus } from "@/hooks/usePrintersWithStatus";
import { GenerateServiceReportDialog } from "@/components/printers/GenerateServiceReportDialog";
import { MarkRepairedDialog } from "@/components/printers/MarkRepairedDialog";
import { PrinterDetailsDialog } from "@/components/printers/PrinterDetailsDialog";
import { PrinterHistoryDialog } from "@/components/printers/PrinterHistoryDialog";
import { Fab } from "@/components/ui/fab";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  "pending": { label: "Pending", color: "bg-amber-100 text-amber-800" },
  "in_progress": { label: "In Progress", color: "bg-blue-100 text-blue-800" },
  "completed": { label: "Completed", color: "bg-green-100 text-green-800" },
  "not_tracked": { label: "No Record", color: "bg-muted text-muted-foreground" },
};

// Define the type for the form state to fix the type error
type MaintenanceFormState = {
  printerId: string;
  status: PrinterStatus;
  notes: string;
};

export default function Maintenance() {
  const { printers, loading, refetch } = usePrintersWithStatus();
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  
  const [quickUpdateDialogOpen, setQuickUpdateDialogOpen] = useState(false);
  const [serviceReportDialogOpen, setServiceReportDialogOpen] = useState(false);
  const [markRepairedDialogOpen, setMarkRepairedDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [addMaintOpen, setAddMaintOpen] = useState(false);
  const [addMaintForm, setAddMaintForm] = useState<MaintenanceFormState>({
    printerId: "",
    status: "maintenance",
    notes: "",
  });

  const { toast } = useToast();

  const handleOpenAddMaint = () => {
    setAddMaintOpen(true);
    setAddMaintForm({ printerId: "", status: "maintenance", notes: "" });
  };

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addMaintForm.printerId) {
      toast({ title: "Select a printer" });
      return;
    }
    try {
      const { error } = await supabase
        .from("maintenance_records")
        .insert({
          printer_id: addMaintForm.printerId,
          status: "pending" as MaintenanceStatus, // Use typed MaintenanceStatus
          issue_description: addMaintForm.notes,
          created_at: new Date().toISOString(),
          activity_type: addMaintForm.status === "maintenance" ? "maintenance" : "repair"
        });
      
      if (error) throw error;
      
      // After creating the maintenance record, update the printer status
      const { error: printerUpdateError } = await supabase
        .from("printers")
        .update({ 
          status: addMaintForm.status,
          updated_at: new Date().toISOString() 
        })
        .eq("id", addMaintForm.printerId);
        
      if (printerUpdateError) throw printerUpdateError;
      
      toast({ title: "Maintenance record added" });
      setAddMaintOpen(false);
      setAddMaintForm({ printerId: "", status: "maintenance", notes: "" });
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Define the handler functions that were missing or misnamed
  const setQuickUpdateDialog = (printer: Printer) => {
    setSelectedPrinter(printer);
    setQuickUpdateDialogOpen(true);
  };

  const setServiceReportDialog = (printer: Printer) => {
    setSelectedPrinter(printer);
    setServiceReportDialogOpen(true);
  };

  const setMarkRepairedDialog = (printer: Printer) => {
    setSelectedPrinter(printer);
    setMarkRepairedDialogOpen(true);
  };

  const setDetailsDialog = (printer: Printer) => {
    setSelectedPrinter(printer);
    setDetailsDialogOpen(true);
  };

  const setHistoryDialog = (printer: Printer) => {
    setSelectedPrinter(printer);
    setHistoryDialogOpen(true);
  };

  const maintenancePrinters = printers.filter(
    printer => printer.status === "maintenance" || printer.status === "for_repair"
  );

  return (
    <div className="container mx-auto px-2 py-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Wrench className="h-7 w-7 text-sky-700" />
        <h1 className="text-2xl font-bold">Repair & Maintenance</h1>
      </div>
      <div className="mb-4 text-muted-foreground max-w-2xl">
        Quickly log and update printer repair or maintenance records for your fleet.
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : maintenancePrinters.length === 0 ? (
        <div className="text-center text-muted-foreground py-10">
          No printers currently in maintenance or repair status.
        </div>
      ) : (
        <div className="space-y-4">
          {maintenancePrinters.map((printer) => (
            <Card key={printer.id}>
              <CardHeader className="p-4 pb-2 flex flex-row gap-2 items-center justify-between">
                <div className="flex items-center gap-2">
                  <PrinterIcon className="h-5 w-5" />
                  <CardTitle className="text-md">{`${printer.make} ${printer.model}`}</CardTitle>
                  <span className="ml-2">
                    <Badge
                      variant="secondary"
                      className={STATUS_LABELS[printer.maintenanceStatus || "not_tracked"].color}
                    >
                      {STATUS_LABELS[printer.maintenanceStatus || "not_tracked"].label}
                    </Badge>
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Badge 
                    variant="outline" 
                    className={printer.status === "maintenance" ? 
                      "bg-amber-50 text-amber-700 border-amber-200" : 
                      "bg-red-50 text-red-700 border-red-200"}
                  >
                    {printer.status === "maintenance" ? "Maintenance" : "For Repair"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-xs text-muted-foreground flex flex-wrap gap-4 mb-3">
                  <span>SN: {printer.serialNumber ?? "N/A"}</span>
                  <span>
                    Owner: {printer.owned_by === "client" ? 
                      `Client (${printer.assigned_to || "Unassigned"})` : 
                      "System Unit"}
                  </span>
                  <span>Location: {printer.location ?? "-"}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => setQuickUpdateDialog(printer)}
                  >
                    <Wrench className="h-4 w-4" />
                    <span>Quick Update</span>
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => setServiceReportDialog(printer)}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Generate Report</span>
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => setMarkRepairedDialog(printer)}
                  >
                    <Check className="h-4 w-4" />
                    <span>Repaired</span>
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => setDetailsDialog(printer)}
                  >
                    <Info className="h-4 w-4" />
                    <span>Details</span>
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => setHistoryDialog(printer)}
                  >
                    <History className="h-4 w-4" />
                    <span>History</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Fab
        icon={<Plus size={24} />}
        aria-label="Add Maintenance"
        onClick={handleOpenAddMaint}
        className="fixed bottom-6 right-6 z-50"
      />

      <Dialog open={addMaintOpen} onOpenChange={setAddMaintOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Maintenance/Repair Log</DialogTitle>
          </DialogHeader>
          <form className="space-y-2 py-2" onSubmit={handleAddMaintenance}>
            <div>
              <label className="text-sm">Printer*</label>
              <select
                className="w-full border rounded p-2"
                value={addMaintForm.printerId}
                onChange={e =>
                  setAddMaintForm({ ...addMaintForm, printerId: e.target.value })
                }
                required
              >
                <option value="">Select a printer...</option>
                {printers.map(printer => (
                  <option key={printer.id} value={printer.id}>
                    {printer.make} {printer.model}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm">Status*</label>
              <select
                className="w-full border rounded p-2"
                value={addMaintForm.status}
                onChange={e =>
                  setAddMaintForm({ ...addMaintForm, status: e.target.value as PrinterStatus })
                }
                required
              >
                <option value="maintenance">Maintenance</option>
                <option value="for_repair">For Repair</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Notes</label>
              <Input
                value={addMaintForm.notes}
                onChange={e =>
                  setAddMaintForm({ ...addMaintForm, notes: e.target.value })
                }
                placeholder="Add remarks, issues, etc."
              />
            </div>
            <DialogFooter className="gap-2 pt-4">
              <Button type="submit" variant="default">Save</Button>
              <Button variant="ghost" type="button" onClick={() => setAddMaintOpen(false)}>Cancel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {selectedPrinter && (
        <>
          <MaintenanceQuickUpdateDialog
            open={quickUpdateDialogOpen}
            onOpenChange={(open) => {
              setQuickUpdateDialogOpen(open);
              if (!open) setSelectedPrinter(null);
              if (!open) refetch();
            }}
            printer={selectedPrinter}
            onSuccess={refetch}
          />

          <GenerateServiceReportDialog
            open={serviceReportDialogOpen}
            onOpenChange={(open) => {
              setServiceReportDialogOpen(open);
              if (!open) setSelectedPrinter(null);
              if (!open) refetch();
            }}
            printer={selectedPrinter}
            onSuccess={refetch}
          />

          <MarkRepairedDialog
            open={markRepairedDialogOpen}
            onOpenChange={(open) => {
              setMarkRepairedDialogOpen(open);
              if (!open) setSelectedPrinter(null);
              if (!open) refetch();
            }}
            printer={selectedPrinter}
            onSuccess={refetch}
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
        </>
      )}

      <BottomNavigation />
    </div>
  );
}
