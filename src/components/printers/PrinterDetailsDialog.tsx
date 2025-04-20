
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrinterType } from "@/types/types";
import { PrinterDetailsTab } from "./tabs/PrinterDetailsTab";
import { PrinterMaintenanceTab } from "./tabs/PrinterMaintenanceTab";
import { PrinterTransferTab } from "./tabs/PrinterTransferTab";
import { PrinterTonerTab } from "./tabs/PrinterTonerTab";
import { MaintenanceLogType, TransferLogType, TonerType } from "@/types/types";
import { MaintenanceLogDialog } from "./MaintenanceLogDialog";
import { useState } from "react";
import { TransferDialog } from "./TransferDialog";
import { Department } from "@/types/printers"; // Import correct Department type

interface PrinterDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printer: PrinterType;
  onUpdate: (printer: PrinterType) => void;
  transferLogs: TransferLogType[];
  maintenanceLogs: MaintenanceLogType[];
  clients: Array<{ id: string; name: string }>;
  departments: Department[]; // Use correct Department type
  users: Array<{ id: string; name: string }>;
  toners: TonerType[];
  onAddTransferLog: (log: TransferLogType) => void;
  onAddMaintenanceLog: (log: MaintenanceLogType) => void;
}

export function PrinterDetailsDialog({
  open,
  onOpenChange,
  printer,
  onUpdate,
  transferLogs,
  maintenanceLogs,
  clients,
  departments,
  users,
  toners,
  onAddTransferLog,
  onAddMaintenanceLog,
}: PrinterDetailsDialogProps) {
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const handleMaintenanceLogAdded = (log: MaintenanceLogType) => {
    onAddMaintenanceLog(log);
    setIsMaintenanceDialogOpen(false);
  };

  const handleTransferLogAdded = (log: TransferLogType) => {
    onAddTransferLog(log);
    setIsTransferDialogOpen(false);
    // Close the dialog after transfer
    onOpenChange(false);
  };

  const openMaintenanceDialog = () => {
    setIsMaintenanceDialogOpen(true);
  };

  const openTransferDialog = () => {
    setIsTransferDialogOpen(true);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-4xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{printer.model}</AlertDialogTitle>
          <AlertDialogDescription>
            Manage and view details for this printer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>
              Here you can manage the details of the printer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                <TabsTrigger value="transfer">Transfer</TabsTrigger>
                <TabsTrigger value="toner">Toner</TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <PrinterDetailsTab printer={printer} onUpdate={onUpdate} canEdit />
              </TabsContent>
              <TabsContent value="maintenance">
                <PrinterMaintenanceTab
                  printerId={printer.id}
                  maintenanceLogs={maintenanceLogs}
                  onOpenMaintenanceDialog={openMaintenanceDialog}
                />
              </TabsContent>
              <TabsContent value="transfer">
                <PrinterTransferTab
                  printer={printer}
                  onOpenTransferDialog={openTransferDialog}
                />
              </TabsContent>
              <TabsContent value="toner">
                <PrinterTonerTab 
                  printer={printer} 
                  toners={toners} 
                  onUpdate={onUpdate}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Close</AlertDialogAction>
        </AlertDialogFooter>

        {/* Maintenance Dialog */}
        <MaintenanceLogDialog
          open={isMaintenanceDialogOpen}
          onOpenChange={setIsMaintenanceDialogOpen}
          printerId={printer.id}
          printerModel={printer.model}
          onAddLog={handleMaintenanceLogAdded}
        />

        {/* Transfer Dialog */}
        <TransferDialog
          open={isTransferDialogOpen}
          onOpenChange={setIsTransferDialogOpen}
          printerId={printer.id}
          printerModel={printer.model}
          currentClient={printer.client}
          currentClientId={printer.clientId}
          currentDepartment={printer.department}
          currentDepartmentId={printer.departmentId}
          currentUser={printer.assignedAdmin}
          currentUserId={printer.assignedUserId}
          clients={clients}
          departments={departments}
          users={users}
          onTransfer={handleTransferLogAdded}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}
