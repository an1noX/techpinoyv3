
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PrinterFormValues } from "../printer-form-schema";
import { useState, useEffect } from "react";

interface PrinterMake {
  id: string;
  name: string;
}

interface PrinterSeries {
  id: string;
  name: string;
  makeId: string;
}

interface GeneralInfoSectionProps {
  form: UseFormReturn<PrinterFormValues>;
  makes?: PrinterMake[];
  series?: PrinterSeries[];
  onAddNewMake?: (make: string) => void;
  onAddNewSeries?: (series: string, makeId: string) => void;
}

export function GeneralInfoSection({ 
  form, 
  makes = [], 
  series = [],
  onAddNewMake,
  onAddNewSeries 
}: GeneralInfoSectionProps) {
  const { register, formState: { errors }, setValue, watch } = form;
  const [filteredSeries, setFilteredSeries] = useState<PrinterSeries[]>([]);
  const [printerName, setPrinterName] = useState<string>("");
  
  const selectedMake = watch("make");
  const selectedSeries = watch("series");
  const selectedModel = watch("model");
  
  // Filter series based on selected make
  useEffect(() => {
    if (selectedMake) {
      const filtered = series.filter(s => s.makeId === selectedMake);
      setFilteredSeries(filtered);
      
      // Reset series if current selection doesn't match the new make
      const currentSeriesExists = filtered.some(s => s.id === selectedSeries);
      if (selectedSeries && !currentSeriesExists) {
        setValue("series", "");
      }
    } else {
      setFilteredSeries([]);
      setValue("series", "");
    }
    
    // Update printer name
    updatePrinterName();
  }, [selectedMake, selectedSeries, selectedModel, series]);
  
  // Update printer name
  const updatePrinterName = () => {
    const make = makes.find(m => m.id === selectedMake)?.name || "";
    const series = filteredSeries.find(s => s.id === selectedSeries)?.name || "";
    const model = selectedModel || "";
    
    const name = [make, series, model].filter(Boolean).join(" ");
    setPrinterName(name);
  };
  
  const handleAddNewMake = () => {
    const newMakeName = window.prompt("Enter new make/brand name");
    if (newMakeName && onAddNewMake) {
      onAddNewMake(newMakeName);
    }
  };
  
  const handleAddNewSeries = () => {
    if (!selectedMake) {
      alert("Please select a make first");
      return;
    }
    
    const newSeriesName = window.prompt("Enter new series name");
    if (newSeriesName && onAddNewSeries) {
      onAddNewSeries(newSeriesName, selectedMake);
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">General Information</h3>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label>Printer Name (Auto-generated)</Label>
          <Input value={printerName} disabled className="bg-gray-100" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="make">Make (Brand)</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select 
                value={selectedMake} 
                onValueChange={(value) => setValue("make", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select make" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {makes.map((make) => (
                    <SelectItem key={make.id} value={make.id}>
                      {make.name}
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
                onClick={handleAddNewMake}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {errors.make && (
            <p className="text-red-500 text-sm">{errors.make.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="series">Series</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select 
                value={selectedSeries} 
                onValueChange={(value) => setValue("series", value)}
                disabled={!selectedMake}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedMake ? "Select series" : "Select make first"} />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {filteredSeries.map((series) => (
                    <SelectItem key={series.id} value={series.id}>
                      {series.name}
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
                onClick={handleAddNewSeries}
                disabled={!selectedMake}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {errors.series && (
            <p className="text-red-500 text-sm">{errors.series.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="model">Model</Label>
          <Input 
            id="model" 
            type="text" 
            {...register("model")} 
            disabled={!selectedSeries}
            placeholder={selectedSeries ? "Enter model" : "Select series first"}
          />
          {errors.model && (
            <p className="text-red-500 text-sm">{errors.model.message}</p>
          )}
        </div>
      </div>
      
      {selectedMake && selectedSeries && selectedModel && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <Label className="font-medium">Full Printer Name</Label>
          <p className="text-lg">{printerName}</p>
        </div>
      )}
    </div>
  );
}
