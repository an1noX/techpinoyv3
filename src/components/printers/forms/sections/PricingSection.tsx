
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PrinterFormValues } from "../printer-form-schema";

interface PricingSectionProps {
  form: UseFormReturn<PrinterFormValues>;
}

export function PricingSection({ form }: PricingSectionProps) {
  const { register, formState: { errors } } = form;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pricing</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price</Label>
          <Input 
            id="price" 
            type="number" 
            {...register("price", { valueAsNumber: true })} 
          />
          {errors.price && (
            <p className="text-red-500 text-sm">{errors.price.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="rentalPrice">Rental Price</Label>
          <Input 
            id="rentalPrice" 
            type="number" 
            {...register("rentalPrice", { valueAsNumber: true })} 
          />
          {errors.rentalPrice && (
            <p className="text-red-500 text-sm">{errors.rentalPrice.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
