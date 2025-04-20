
import { PrinterType } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PrinterInfoCardProps {
  printer: PrinterType;
  className?: string;
}

export function PrinterInfoCard({ printer, className }: PrinterInfoCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Printer Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Make:</span>
            <span className="font-medium">{printer.make}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Series:</span>
            <span className="font-medium">{printer.series}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Model:</span>
            <span className="font-medium">{printer.model}</span>
          </div>
          {printer.serialNumber && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Serial Number:</span>
              <span className="font-medium">{printer.serialNumber}</span>
            </div>
          )}
          {printer.type && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{printer.type}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
