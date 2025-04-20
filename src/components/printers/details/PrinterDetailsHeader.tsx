
import { PrinterType } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

interface PrinterDetailsHeaderProps {
  printer: PrinterType;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function PrinterDetailsHeader({ 
  printer, 
  onBack, 
  onEdit, 
  onDelete 
}: PrinterDetailsHeaderProps) {
  return (
    <div className="flex items-center mb-4">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onBack}
        className="mr-2"
      >
        <ArrowLeft size={20} />
      </Button>
      <h1 className="text-2xl font-bold flex-1">
        {`${printer.make} ${printer.model}`}
      </h1>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onEdit}
        className="mr-2"
      >
        <Pencil size={20} />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onDelete}
      >
        <Trash2 size={20} />
      </Button>
    </div>
  );
}
