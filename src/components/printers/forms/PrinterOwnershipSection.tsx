
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PrinterFormValues } from './printer-form-schema';
import { PrinterOwnershipType } from '@/types/types';

interface PrinterOwnershipSectionProps {
  form: UseFormReturn<PrinterFormValues>;
  onOwnershipChange?: (value: PrinterOwnershipType) => void;
  clients?: Array<{ id: string; name: string }>; // Add clients prop
}

export function PrinterOwnershipSection({ form, onOwnershipChange, clients }: PrinterOwnershipSectionProps) {
  const handleOwnershipChange = (value: PrinterOwnershipType) => {
    if (onOwnershipChange) {
      onOwnershipChange(value);
    }
  };

  return (
    <FormField
      control={form.control}
      name="ownership"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Ownership</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={(value) => {
                field.onChange(value as PrinterOwnershipType);
                handleOwnershipChange(value as PrinterOwnershipType);
              }}
              value={field.value}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="ownership-system" />
                <Label htmlFor="ownership-system">System Asset</Label>
                <FormDescription className="ml-2 mt-0">
                  Owned by the organization
                </FormDescription>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="client" id="ownership-client" />
                <Label htmlFor="ownership-client">Client Owned</Label>
                <FormDescription className="ml-2 mt-0">
                  Owned by a client
                </FormDescription>
              </div>
            </RadioGroup>
          </FormControl>
          
          {/* We could add client selection here if needed, using the clients prop */}
        </FormItem>
      )}
    />
  );
}
