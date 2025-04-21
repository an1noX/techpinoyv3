
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { WikiToner, TonerType } from "@/types/types";
import { PrinterFormValues } from "@/components/printers/forms/printer-form-schema";
import { wikiTonerToTonerType } from "@/utils/typeHelpers";

interface TonerSelectorProps {
  value: string;
  onChange: (value: string) => void;
  toners: TonerType[];
}

export const TonerSelector = ({ value, onChange, toners }: TonerSelectorProps) => {
  return (
    <select 
      className="w-full rounded-md border border-input bg-background px-3 py-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select primary toner</option>
      {toners.map((toner) => (
        <option key={toner.id} value={toner.id}>
          {toner.name || `${toner.brand} ${toner.model} (${toner.color})`}
        </option>
      ))}
    </select>
  );
};

interface TonerSectionProps {
  form: UseFormReturn<PrinterFormValues>;
  toners: WikiToner[];
  selectedToners: string[];
  onTonerChange: (tonerId: string) => void;
  onAddToner?: (toner: WikiToner) => void;
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

  // Convert WikiToner to TonerType for type compatibility
  const convertedToners = toners.map(wikiTonerToTonerType);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Compatible Toners</h3>
      {onAddToner && (
        <div className="mb-4">
          <Label className="mb-2 block">Primary Toner</Label>
          <TonerSelector
            value={selectedToners[0] || ""}
            onChange={handleTonerSelectorChange}
            toners={convertedToners}
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
              <Label htmlFor={`toner-${toner.id}`}>{toner.name || `${toner.brand} ${toner.model}`}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
