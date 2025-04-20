
import { UseFormReturn } from "react-hook-form";
import { PrinterFormValues } from "./printer-form-schema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrinterOwnershipType } from "@/types/types";

interface PrinterOwnershipSectionProps {
  form: UseFormReturn<PrinterFormValues>;
  ownershipType: PrinterOwnershipType;
  clients: Array<{ id: string; name: string }>;
}

export function PrinterOwnershipSection({ 
  form, 
  ownershipType,
  clients
}: PrinterOwnershipSectionProps) {
  const { control, setValue, watch } = form;
  
  return (
    <Card className="bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Ownership Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Ownership Type</Label>
            <RadioGroup
              value={watch("ownership")}
              onValueChange={(value: PrinterOwnershipType) => setValue("ownership", value)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system_asset" id="system" />
                <Label htmlFor="system">Service Unit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="client_owned" id="client" />
                <Label htmlFor="client">Client Owned</Label>
              </div>
            </RadioGroup>
          </div>

          {ownershipType === "client_owned" && (
            <div>
              <Label>Assigned Client</Label>
              <Select
                value={watch("clientId") || "none"}
                onValueChange={(value) => setValue("clientId", value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select Client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
