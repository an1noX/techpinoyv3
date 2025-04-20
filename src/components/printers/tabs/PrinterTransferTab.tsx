
import React from 'react';
import { Button } from '@/components/ui/button';
import { PrinterType } from '@/types/types';
import { ArrowRightCircle } from 'lucide-react';

interface PrinterTransferTabProps {
  printer: PrinterType;
  onOpenTransferDialog: () => void;
}

export function PrinterTransferTab({ printer, onOpenTransferDialog }: PrinterTransferTabProps) {
  return (
    <div>
      <h3 className="font-medium mb-4">Transfer Printer</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current Client</p>
            <p>{printer.client || 'None assigned'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current Department</p>
            <p>{printer.department || 'None assigned'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current Location</p>
            <p>{printer.location || 'None assigned'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Assigned Admin</p>
            <p>{printer.assignedAdmin || 'None assigned'}</p>
          </div>
        </div>
        
        <Button onClick={onOpenTransferDialog} className="w-full">
          <ArrowRightCircle className="h-4 w-4 mr-2" />
          Transfer Printer
        </Button>
      </div>
    </div>
  );
}
