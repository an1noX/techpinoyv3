
import { PrinterType, MaintenanceLogType, TransferLogType, TonerType } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Printer, Info, Wrench, Clock, ChevronRight, CircleAlert 
} from "lucide-react";
import { TonerSlideshow } from "../TonerSlideshow";
import { RelatedToners } from "../RelatedToners";
import { PrinterOverview } from "./PrinterOverview";
import { PrinterDetailCards } from "./PrinterDetailCards";
import { ProductBenefits } from "./ProductBenefits";
import { toFrontendMaintenanceLog, toFrontendTransferLog } from "@/utils/typeHelpers";

interface PublicViewProps {
  printer: PrinterType;
  transferLogs: TransferLogType[];
  maintenanceLogs: MaintenanceLogType[];
  compatibleToners: TonerType[];
  relatedToners: TonerType[];
}

export function PublicView({
  printer,
  transferLogs,
  maintenanceLogs,
  compatibleToners,
  relatedToners
}: PublicViewProps) {
  const placeholderImage = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/832px-No-Image-Placeholder.svg.png";

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-4 flex items-center justify-center bg-white border rounded-md">
          <img 
            src={placeholderImage} 
            alt={printer.model} 
            className="max-h-[300px] object-contain"
          />
        </div>
        
        <PrinterOverview 
          printer={printer} 
          maintenanceLogsCount={maintenanceLogs.filter(log => log.printer_id === printer.id).length}
          transferLogsCount={transferLogs.filter(log => log.printer_id === printer.id).length}
          compatibleToners={compatibleToners}
        />
      </div>
      
      {/* Compatible Toners Carousel */}
      {compatibleToners.length > 0 && (
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-[#004165]">Compatible Toners for {printer.model}</h3>
          </div>
          
          <TonerSlideshow toners={compatibleToners} printerModel={printer.model} />
        </div>
      )}
      
      {/* Related Toners - Vertical List */}
      {relatedToners.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-[#004165] mb-4">Related Products You May Also Need</h3>
          <RelatedToners toners={relatedToners} printerMake={printer.make || "Unknown"} />
        </div>
      )}
      
      {/* Additional Product Information */}
      <ProductBenefits printerModel={printer.model} />
    </div>
  );
}
