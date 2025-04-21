
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PrinterOwnershipType } from "@/types/types";
import { PrinterFormValues } from "./printer-form-schema";

interface PrinterOwnershipSectionProps {
  form: UseFormReturn<PrinterFormValues>;
  ownershipType: PrinterOwnershipType;
  clients: { id: string; name: string }[];
}

export function PrinterOwnershipSection({
  form,
  ownershipType,
  clients
}: PrinterOwnershipSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Ownership Information</h3>
      
      <FormField
        control={form.control}
        name="ownership"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Ownership Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system_asset" id="system_asset" />
                  <Label htmlFor="system_asset">Internal Asset (owned by your company)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="client_owned" id="client_owned" />
                  <Label htmlFor="client_owned">Client Owned</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {ownershipType === "client_owned" && (
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
