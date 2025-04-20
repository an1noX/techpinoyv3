
import { PrinterType, TonerType } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, CircleAlert } from "lucide-react";
import { PrinterDetailCards } from "./PrinterDetailCards";

interface PrinterOverviewProps {
  printer: PrinterType;
  maintenanceLogsCount: number;
  transferLogsCount: number;
  compatibleToners: TonerType[];
}

export function PrinterOverview({
  printer,
  maintenanceLogsCount,
  transferLogsCount,
  compatibleToners
}: PrinterOverviewProps) {
  return (
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
      
      <PrinterDetailCards 
        model={printer.model} 
        maintenanceCount={maintenanceLogsCount}
        transferCount={transferLogsCount}
      />
      
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
  );
}
