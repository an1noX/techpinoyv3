
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Printer, Wrench, Clock } from "lucide-react";

interface PrinterDetailCardsProps {
  model: string;
  maintenanceCount: number;
  transferCount: number;
}

export function PrinterDetailCards({
  model,
  maintenanceCount,
  transferCount
}: PrinterDetailCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Info className="h-4 w-4 mr-2 text-blue-500" />
            Series
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3">
          <p className="text-sm">{model.split(' ')[0] || "Unknown"}</p>
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
          <p className="text-sm">{model}</p>
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
          <p className="text-sm">{maintenanceCount} Records</p>
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
          <p className="text-sm">{transferCount} Transfers</p>
        </CardContent>
      </Card>
    </div>
  );
}
