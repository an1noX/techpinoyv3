
import React from 'react';
import { PrinterType } from '@/types/types';

interface PrinterDetailsTabProps {
  printer: PrinterType;
  onUpdate?: (printer: PrinterType) => void;
  canEdit?: boolean;
}

export function PrinterDetailsTab({ printer, onUpdate, canEdit = false }: PrinterDetailsTabProps) {
  return (
    <div>
      <h3 className="font-medium mb-4">Printer Details</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Make</p>
            <p>{printer.make}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Model</p>
            <p>{printer.model}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Series</p>
            <p>{printer.series}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="capitalize">{printer.status}</p>
          </div>
          
          {printer.serialNumber && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
              <p>{printer.serialNumber}</p>
            </div>
          )}
          
          {printer.type && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <p className="capitalize">{printer.type.replace('_', ' ')}</p>
            </div>
          )}
        </div>
        
        {printer.description && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p>{printer.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
