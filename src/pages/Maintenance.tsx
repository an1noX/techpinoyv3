
import React, { useState } from "react";
import { Printer } from "@/types/printers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, Printer as PrinterIcon, FileText, Check } from "lucide-react";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { MaintenanceQuickUpdateDialog } from "@/components/printers/MaintenanceQuickUpdateDialog";
import { usePrintersWithStatus } from "@/hooks/usePrintersWithStatus";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  "pending": { label: "Pending", color: "bg-amber-100 text-amber-800" },
  "in_progress": { label: "In Progress", color: "bg-blue-100 text-blue-800" },
  "completed": { label: "Completed", color: "bg-green-100 text-green-800" },
  "not_tracked": { label: "No Record", color: "bg-muted text-muted-foreground" },
};

export default function Maintenance() {
  const { printers, loading, refetch } = usePrintersWithStatus();
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<string>("quick-update");

  const openDialog = (printer: Printer, tab: string) => {
    setSelectedPrinter(printer);
    setDialogTab(tab);
    setDialogOpen(true);
  };

  // Filter printers to only show those with maintenance or for_repair status
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
                    onClick={() => openDialog(printer, "quick-update")}
                  >
                    <Wrench className="h-4 w-4" />
                    <span>Quick Update</span>
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => openDialog(printer, "generate-report")}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Generate Service Report</span>
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => openDialog(printer, "mark-repaired")}
                  >
                    <Check className="h-4 w-4" />
                    <span>Repaired</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog for Maintenance Management */}
      {selectedPrinter && (
        <MaintenanceQuickUpdateDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setSelectedPrinter(null);
            if (!open) refetch();
          }}
          printer={selectedPrinter}
          onSuccess={refetch}
          initialTab={dialogTab}
        />
      )}

      <BottomNavigation />
    </div>
  );
}

