
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PrinterFormValues } from "../printer-form-schema";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PrinterStatusType } from "@/types/enums"; // Updated import

interface DetailsSectionProps {
  form: UseFormReturn<PrinterFormValues>;
  toners?: Array<{ id: string; name: string }>;
  onAddNewToner?: (toner: string) => void;
}

export function DetailsSection({ form, toners = [], onAddNewToner }: DetailsSectionProps) {
  const { register, formState: { errors }, setValue, watch } = form;
  const [newToner, setNewToner] = useState("");
  
  const handleAddToner = () => {
    if (newToner && onAddNewToner) {
      onAddNewToner(newToner);
      setNewToner("");
    }
  };
  
  return (
    <div className="space-y-6 bg-white p-4 rounded-md shadow-sm">
      <h3 className="text-lg font-medium">Details</h3>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} className="bg-white" />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select 
            value={watch("category") || "printer"} 
            onValueChange={(value) => setValue("category", value)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="bg-white z-[100]">
              <SelectItem value="printer">Printer</SelectItem>
              <SelectItem value="plotter">Plotter</SelectItem>
              <SelectItem value="scanner">Scanner</SelectItem>
              <SelectItem value="copier">Copier</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-red-500 text-sm">{errors.category.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select 
            value={watch("type")} 
            onValueChange={(value) => setValue("type", value)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent className="bg-white z-[100]">
              <SelectItem value="laser">Laser</SelectItem>
              <SelectItem value="inkjet">Inkjet</SelectItem>
              <SelectItem value="dotmatrix">Dot Matrix</SelectItem>
              <SelectItem value="thermal">Thermal</SelectItem>
              <SelectItem value="led">LED</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-red-500 text-sm">{errors.type.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select 
            value={watch("status")} 
            onValueChange={(value) => setValue("status", value as PrinterStatusType)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent className="bg-white z-[100]">
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
              <SelectItem value="deployed">Deployed</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="for_repair">For Repair</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-red-500 text-sm">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="serialNumber">Serial Number</Label>
          <Input 
            id="serialNumber" 
            type="text" 
            {...register("serialNumber")} 
            className="bg-white"
          />
          {errors.serialNumber && (
            <p className="text-red-500 text-sm">{errors.serialNumber.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location" 
            type="text" 
            {...register("location")} 
            className="bg-white"
          />
          {errors.location && (
            <p className="text-red-500 text-sm">{errors.location.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="oemToner">OEM Toner</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select 
                value={watch("oemToner") || "none"} 
                onValueChange={(value) => setValue("oemToner", value === "none" ? "" : value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select toner" />
                </SelectTrigger>
                <SelectContent className="bg-white z-[100]">
                  <SelectItem value="none">Select a toner</SelectItem>
                  {toners.map((toner) => (
                    <SelectItem key={toner.id} value={toner.id}>
                      {toner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="bg-white"
                onClick={() => {
                  const newTonerName = window.prompt("Enter new toner name");
                  if (newTonerName && onAddNewToner) {
                    onAddNewToner(newTonerName);
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
