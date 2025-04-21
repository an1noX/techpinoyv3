import { useState } from "react";
import { PrinterType, TransferLogType, MaintenanceLogType, TonerType, WikiToner } from "@/types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { BaseDialog } from "@/components/common/BaseDialog";
import { TransferDialog } from "../TransferDialog";
import { MaintenanceLogDialog } from "../MaintenanceLogDialog";
import { PrinterDetailsTab } from "../tabs/details/PrinterDetailsTab";
import { PrinterTransferTab } from "../tabs/PrinterTransferTab";
import { PrinterHistoryTab } from "../tabs/PrinterHistoryTab";
import { PrinterMaintenanceTab } from "../tabs/PrinterMaintenanceTab";
import { PrinterTonerTab } from "../tabs/PrinterTonerTab";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Info, Wrench, Clock, PenTool, CircleAlert, ChevronRight, Star } from "lucide-react";
import { TonerSlideshow } from "../TonerSlideshow";
import { RelatedToners } from "../RelatedToners";
import { tonerTypesToWikiToners } from "@/utils/typeHelpers";

interface Department {
  id: string;
  name: string;
  client_id: string;
}

interface PrinterDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printer: PrinterType;
  onUpdate: (printer: PrinterType) => void;
  transferLogs: TransferLogType[];
  maintenanceLogs: MaintenanceLogType[];
  onAddTransferLog: (log: TransferLogType) => void;
  onAddMaintenanceLog: (log: MaintenanceLogType) => void;
  clients: Array<{ id: string; name: string }>;
  departments: Array<Department>;
  users: Array<{ id: string; name: string }>;
  toners?: TonerType[];
}

export function PrinterDetailsDialog({ 
  open, 
  onOpenChange, 
  printer, 
  onUpdate,
  transferLogs,
  maintenanceLogs,
  onAddTransferLog,
  onAddMaintenanceLog,
  clients,
  departments,
  users,
  toners = []
}: PrinterDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const { user, hasPermission } = useAuth();
  const isLoggedIn = !!user;
  
  const wikiToners = tonerTypesToWikiToners(toners);
  
  const canEdit = hasPermission("update:printers");
  const canTransfer = hasPermission("transfer:printers");
  const canViewHistory = hasPermission("read:printers");
  const canManageMaintenance = hasPermission("update:maintenance") || hasPermission("create:maintenance");
  const canManageToners = hasPermission("update:printers");
  
  const compatibleToners = toners.filter(toner => 
    toner.compatibility?.some(model => 
      model.toLowerCase().includes(printer.model.toLowerCase()) || 
      printer.model.toLowerCase().includes(model.toLowerCase())
    )
  );
  
  const relatedToners = toners.filter(toner => 
    !compatibleToners.includes(toner) && 
    printer.make && 
    toner.compatibility?.some(model => 
      model.toLowerCase().includes(printer.make?.toLowerCase() || '') ||
      (toner.manufacturer && toner.manufacturer.toLowerCase() === printer.make.toLowerCase())
    )
  ).slice(0, 5);
  
  const placeholderImage = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/832px-No-Image-Placeholder.svg.png";

  const dialogDescription = isLoggedIn 
    ? `Details for ${printer.model} printer`
    : `Information about ${printer.model} printer and compatible toners`;

  return (
    <>
      <BaseDialog 
        open={open} 
        onOpenChange={onOpenChange}
        title={isLoggedIn ? "Printer Details" : printer.model}
        size="xl"
        showClose={false}
        description={dialogDescription}
      >
        {isLoggedIn ? (
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
                  toners={wikiToners}
                  onUpdate={(updatedPrinter) => onUpdate(updatedPrinter)}
                />
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-4 flex items-center justify-center bg-white border rounded-md">
                <img 
                  src={placeholderImage} 
                  alt={printer.model} 
                  className="max-h-[300px] object-contain"
                />
              </div>
              
              <div>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-[#004165]">{printer.model}</h2>
                  <div className="flex items-center mb-2">
                    <Badge className="bg-blue-50 text-blue-700 py-1 px-2">
                      {printer.make || "Unknown Manufacturer"}
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-700 py-1 px-2 ml-2">
                      {printer.status === "available" ? "Available" : 
                       printer.status === "deployed" ? "Deployed" : 
                       printer.status === "maintenance" ? "Maintenance" : "Archived"}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Info className="h-4 w-4 mr-2 text-blue-500" />
                        Series
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-3 pb-3">
                      <p className="text-sm">{printer.model.split(' ')[0] || "Unknown"}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Printer className="h-4 w-4 mr-2 text-green-500" />
                        Model
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-3 pb-3">
                      <p className="text-sm">{printer.model}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Wrench className="h-4 w-4 mr-2 text-amber-500" />
                        Maintenance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-3 pb-3">
                      <p className="text-sm">{maintenanceLogs.filter(log => log.printerId === printer.id).length} Records</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-purple-500" />
                        History
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-3 pb-3">
                      <p className="text-sm">{transferLogs.filter(log => log.printerId === printer.id).length} Transfers</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#004165] mb-3">Compatible Toners</h3>
                  <p className="text-gray-700 mb-3">
                    Your {printer.model} printer works with the following high-quality replacement toner cartridges, 
                    offering perfect compatibility and excellent print quality at a fraction of OEM prices.
                  </p>
                  
                  {compatibleToners.length > 0 ? (
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {compatibleToners.length} Compatible Products Found
                      </Badge>
                      <Button variant="link" className="text-blue-600 p-0 h-auto">
                        View All Products <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-500 text-sm">
                      <CircleAlert className="h-4 w-4 mr-2" />
                      No compatible toners found
                    </div>
                  )}
                </div>
                
                {printer.notes && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#004165] mb-2">Notes</h3>
                    <p className="text-sm text-gray-700">{printer.notes}</p>
                  </div>
                )}
              </div>
            </div>
            
            {compatibleToners.length > 0 && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-[#004165]">Compatible Toners for {printer.model}</h3>
                </div>
                
                <TonerSlideshow toners={compatibleToners} printerModel={printer.model} />
              </div>
            )}
            
            {relatedToners.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-[#004165] mb-4">Related Products You May Also Need</h3>
                <RelatedToners toners={relatedToners} printerMake={printer.make || "Unknown"} />
              </div>
            )}
            
            <div>
              <h3 className="text-xl font-bold text-[#004165] mb-4">Why Choose Our Compatible Toners?</h3>
              
              <div className="prose max-w-none text-gray-700">
                <p className="mb-4">
                  Our premium compatible cartridges for your {printer.model} offer exceptional value without sacrificing quality. Each cartridge is precisely engineered to fit and function perfectly with your printer, delivering crisp text, vibrant graphics, and reliable performance page after page.
                </p>
                <p className="mb-4">
                  All our compatible toners undergo rigorous quality testing to ensure they meet or exceed OEM specifications, providing you with a reliable, high-quality printing experience at a fraction of the cost of original cartridges.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-[#004165] mb-2">Superior Quality</h4>
                      <p className="text-sm">Premium components and rigorous testing ensure print quality comparable to OEM cartridges</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-[#004165] mb-2">Cost Savings</h4>
                      <p className="text-sm">Save up to 70% compared to original manufacturer cartridges without compromising quality</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-[#004165] mb-2">Satisfaction Guaranteed</h4>
                      <p className="text-sm">All products backed by our 30-day money-back guarantee and expert technical support</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </BaseDialog>
      
      <TransferDialog 
        open={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
        printer={printer} 
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
        onTransfer={onAddTransferLog}
      />
      
      <MaintenanceLogDialog
        open={isMaintenanceDialogOpen}
        onOpenChange={setIsMaintenanceDialogOpen}
        printerId={printer.id}
        printerModel={printer.model}
        onAddLog={onAddMaintenanceLog}
      />
    </>
  );
}
