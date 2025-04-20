
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PrinterFormValues } from "../printer-form-schema";

interface FeaturesSectionProps {
  form: UseFormReturn<PrinterFormValues>;
}

export function FeaturesSection({ form }: FeaturesSectionProps) {
  const { setValue, watch } = form;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Features</h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="isRentalAvailable">Rental Available</Label>
          <Switch
            id="isRentalAvailable"
            checked={watch("isRentalAvailable")}
            onCheckedChange={(checked) => setValue("isRentalAvailable", checked)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="isFeatured">Featured</Label>
          <Switch
            id="isFeatured"
            checked={watch("isFeatured")}
            onCheckedChange={(checked) => setValue("isFeatured", checked)}
          />
        </div>
      </div>
    </div>
  );
}
