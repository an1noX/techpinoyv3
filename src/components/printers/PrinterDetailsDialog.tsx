
import React from "react";
import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/ui/button";
import { Printer } from "@/types/printers";
import { Info } from "lucide-react";

interface PrinterDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printer: Printer;
}

export const PrinterDetailsDialog: React.FC<PrinterDetailsDialogProps> = ({
  open,
  onOpenChange,
  printer,
}) => {
  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Printer Details - ${printer.make} ${printer.model}`}
      size="sm"
      footer={
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="border rounded-md p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Make & Model</p>
              <p className="font-medium">{`${printer.make} ${printer.model}`}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="capitalize font-medium">{printer.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
              <p>{printer.serialNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ownership</p>
              <p>{printer.owned_by === "client" ? "Client Owned" : "System Unit"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Series</p>
              <p>{printer.series || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
              <p>{printer.assigned_to || "Unassigned"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p>{printer.location || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Department</p>
              <p>{printer.department || "N/A"}</p>
            </div>
          </div>
        </div>

        {printer.notes && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
            <div className="border rounded-md p-3 bg-white whitespace-pre-line">
              {printer.notes}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-center">
          <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-sm border border-blue-200 flex items-start gap-2 max-w-md">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p>This view shows the current information for this printer. Use the History view to see past maintenance records, transfers, and other activities.</p>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};
