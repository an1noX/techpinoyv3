import React from 'react';
import { Info } from 'lucide-react';
import { Printer, OwnershipType } from '@/types/printers';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PrinterGeneralInfoProps {
  printer: Printer;
  isEditing: boolean;
  editedPrinter: Partial<Printer>;
  onOwnershipChange: (value: OwnershipType) => void;
}

export function PrinterGeneralInfo({
  printer,
  isEditing,
  editedPrinter,
  onOwnershipChange
}: PrinterGeneralInfoProps) {
  return (
    <div>
      <div className="flex items-center">
        <Info className="h-5 w-5 mr-2 text-muted-foreground" />
        <h3 className="font-medium">General Information</h3>
      </div>
      <Separator className="my-2" />
      <div className="pl-7 space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Make</span>
          <span className="text-sm font-medium">{printer.make}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Series</span>
          <span className="text-sm font-medium">{printer.series}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Model</span>
          <span className="text-sm font-medium">{printer.model}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Owner</span>
          {isEditing ? (
            <Select
              value={editedPrinter.owned_by || printer.owned_by}
              onValueChange={onOwnershipChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System Owned</SelectItem>
                <SelectItem value="client">Client Owned</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <span className="text-sm font-medium capitalize">
              {printer.owned_by === 'system' ? 'System Owned' : 'Client Owned'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}