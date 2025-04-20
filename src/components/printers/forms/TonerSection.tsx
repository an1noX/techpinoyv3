
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { PrinterFormValues } from "./printer-form-schema";
import { TonerType } from "@/types/types";
import { TonerSelector } from "@/components/toners/TonerSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

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
    <Card className="bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Toner Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <FormLabel>Primary Toner</FormLabel>
            {onAddToner && (
              <TonerSelector
                value={selectedToners[0] || ""}
                onChange={handleTonerSelectorChange}
                onAddToner={onAddToner}
                toners={toners}
              />
            )}
          </div>
          
          <div>
            <FormLabel>Compatible Toners</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border rounded p-2">
              {toners.map((toner) => (
                <div key={toner.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`toner-${toner.id}`}
                    checked={selectedToners.includes(toner.id)}
                    onCheckedChange={() => onTonerChange(toner.id)}
                  />
                  <FormLabel htmlFor={`toner-${toner.id}`} className="cursor-pointer">
                    {toner.name}
                  </FormLabel>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
