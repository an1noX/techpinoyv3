
import { PrinterType, TonerType } from "@/types/types";
import { PrinterForm } from "./PrinterForm";

interface AddPrinterFormProps {
  printer?: PrinterType;
  toners: TonerType[];
  clients?: Array<{ id: string; name: string }>;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PrinterType) => void;
  onAddToner?: (toner: TonerType) => void;
}

export function AddPrinterForm(props: AddPrinterFormProps) {
  return <PrinterForm {...props} />;
}
