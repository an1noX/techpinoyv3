
import { PrinterType, TransferLogType, MaintenanceLogType, TonerType } from "@/types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { PrinterDetailsTab } from "../tabs/details/PrinterDetailsTab";
import { PrinterTransferTab } from "../tabs/PrinterTransferTab";
import { PrinterHistoryTab } from "../tabs/PrinterHistoryTab";
import { PrinterMaintenanceTab } from "../tabs/PrinterMaintenanceTab";
import { PrinterTonerTab } from "../tabs/PrinterTonerTab";

interface LoggedInViewProps {
  printer: PrinterType;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUpdate: (printer: PrinterType) => void;
  transferLogs: TransferLogType[];
  maintenanceLogs: MaintenanceLogType[];
  setIsTransferDialogOpen: (isOpen: boolean) => void;
  setIsMaintenanceDialogOpen: (isOpen: boolean) => void;
  toners: TonerType[];
}

export function LoggedInView({
  printer,
  activeTab,
  setActiveTab,
  onUpdate,
  transferLogs,
  maintenanceLogs,
  setIsTransferDialogOpen,
  setIsMaintenanceDialogOpen,
  toners
}: LoggedInViewProps) {
  const { hasPermission } = useAuth();
  
  // Fix: Update permission checks to use single string format 
  const canEdit = hasPermission("update:printers");
  const canTransfer = hasPermission("transfer:printers");
  const canViewHistory = hasPermission("read:printers");
  const canManageMaintenance = hasPermission("update:maintenance") || hasPermission("create:maintenance");
  const canManageToners = hasPermission("update:printers");

  return (
    <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="details">Details</TabsTrigger>
        {canTransfer && <TabsTrigger value="transfer">Transfer</TabsTrigger>}
        {canViewHistory && <TabsTrigger value="history">History</TabsTrigger>}
        {canManageMaintenance && <TabsTrigger value="maintenance">Maintenance</TabsTrigger>}
        {canManageToners && <TabsTrigger value="toners">Toners</TabsTrigger>}
      </TabsList>
      
      <TabsContent value="details">
        <PrinterDetailsTab 
          printer={printer} 
          onUpdate={onUpdate} 
          canEdit={canEdit} 
        />
      </TabsContent>
      
      {canTransfer && (
        <TabsContent value="transfer">
          <PrinterTransferTab 
            printer={printer} 
            onOpenTransferDialog={() => setIsTransferDialogOpen(true)} 
          />
        </TabsContent>
      )}
      
      {canViewHistory && (
        <TabsContent value="history">
          <PrinterHistoryTab 
            transferLogs={transferLogs} 
            printerId={printer.id} 
          />
        </TabsContent>
      )}
      
      {canManageMaintenance && (
        <TabsContent value="maintenance">
          <PrinterMaintenanceTab 
            maintenanceLogs={maintenanceLogs}
            printerId={printer.id}
            onOpenMaintenanceDialog={() => setIsMaintenanceDialogOpen(true)}
          />
        </TabsContent>
      )}

      {canManageToners && (
        <TabsContent value="toners">
          <PrinterTonerTab 
            printer={printer}
            toners={toners}
            onUpdate={(updatedPrinter) => onUpdate(updatedPrinter)}
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
