
import { PrinterType, TransferLogType, MaintenanceLogType, TonerType } from "@/components/printers/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { PrinterDetailsTab } from "../tabs/details/PrinterDetailsTab";
import { PrinterTransferTab } from "../tabs/PrinterTransferTab";
import { PrinterHistoryTab } from "../tabs/PrinterHistoryTab";
import { PrinterMaintenanceTab } from "../tabs/PrinterMaintenanceTab";
import { PrinterTonerTab } from "../tabs/PrinterTonerTab";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const { hasPermission, user } = useAuth();
  const [isAssignedTechnician, setIsAssignedTechnician] = useState(false);
  
  useEffect(() => {
    if (user) {
      checkAssignment();
    }
  }, [user, printer.id]);
  
  const checkAssignment = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_printer_assignments')
        .select('id')
        .eq('user_id', user.id)
        .eq('printer_id', printer.id)
        .maybeSingle();
        
      if (error) {
        console.error('Error checking printer assignment:', error);
        return;
      }
      
      setIsAssignedTechnician(!!data);
    } catch (error) {
      console.error('Error in checkAssignment:', error);
    }
  };
  
  // Permission checks
  const canEdit = hasPermission("update:printers") && (hasPermission("admin") || isAssignedTechnician);
  const canTransfer = hasPermission("transfer:printers");
  const canViewHistory = hasPermission("read:printers");
  const canManageMaintenance = (hasPermission("update:maintenance") || hasPermission("create:maintenance")) && 
                              (hasPermission("admin") || isAssignedTechnician);
  const canManageToners = hasPermission("update:printers") && (hasPermission("admin") || isAssignedTechnician);

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
