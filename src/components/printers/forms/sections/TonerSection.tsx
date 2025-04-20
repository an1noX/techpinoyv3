
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TonerType } from "@/types/types";
import { PrinterFormValues } from "../printer-form-schema";
import { TonerSelector } from "@/components/toners/TonerSelector";

interface TonerSectionProps {
  form: UseFormReturn<PrinterFormValues>;
  toners: TonerType[];
  selectedToners: string[];
  onTonerChange: (tonerId: string) => void;
  onAddToner?: (toner: TonerType) => void;
}

export function TonerSection({ 
  form, 
  toners, 
  selectedToners, 
  onTonerChange,
  onAddToner 
}: TonerSectionProps) {
  const handleTonerSelectorChange = (tonerId: string) => {
    // This function would update a primary toner field if we had one
    // For now, we just add it to the selectedToners array
    if (!selectedToners.includes(tonerId)) {
      onTonerChange(tonerId);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Compatible Toners</h3>
      {onAddToner && (
        <div className="mb-4">
          <Label className="mb-2 block">Primary Toner</Label>
          <TonerSelector
            value={selectedToners[0] || ""}
            onChange={handleTonerSelectorChange}
            toners={toners}
          />
        </div>
      )}
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border rounded p-2">
          {toners.map((toner) => (
            <div key={toner.id} className="flex items-center space-x-2">
              <Checkbox
                id={`toner-${toner.id}`}
                checked={selectedToners.includes(toner.id)}
                onCheckedChange={() => onTonerChange(toner.id)}
              />
              <Label htmlFor={`toner-${toner.id}`}>{toner.name}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
