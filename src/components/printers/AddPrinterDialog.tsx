
import { PrinterType, TonerType } from "@/components/printers/types";
import { AddPrinterForm } from "./forms/AddPrinterForm";
import { BaseDialog } from "@/components/common/BaseDialog";

interface AddPrinterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPrinter: (printer: PrinterType) => void;
  onAddToner: (toner: TonerType) => void;
  clients: Array<{ id: string; name: string }>;
  toners: TonerType[];
}

export function AddPrinterDialog({ 
  open, 
  onOpenChange, 
  onAddPrinter, 
  onAddToner,
  clients,
  toners
}: AddPrinterDialogProps) {
  // Rather than immediately closing the dialog on success,
  // we'll let the AddPrinterForm component handle this itself
  const handlePrinterSubmit = (printer: PrinterType) => {
    onAddPrinter(printer);
    // We don't call onOpenChange(false) here anymore
    // The form will handle its own submission state
  };

  return (
    <BaseDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="Add New Printer"
      description="Fill in the details to add a new printer to the inventory"
      size="lg"
    >
      <AddPrinterForm
        printer={undefined}
        toners={toners}
        clients={clients}
        open={open}
        onClose={() => onOpenChange(false)}
        onSubmit={handlePrinterSubmit}
        onAddToner={onAddToner}
      />
    </BaseDialog>
  );
}
