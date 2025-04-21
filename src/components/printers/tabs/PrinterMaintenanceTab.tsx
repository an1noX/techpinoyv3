
import React from 'react';
import { Button } from '@/components/ui/button';
import { MaintenanceLogType } from '@/types/types';
import { PlusCircle } from 'lucide-react';
import { format } from 'date-fns';

interface PrinterMaintenanceTabProps {
  printerId: string;
  maintenanceLogs: MaintenanceLogType[];
  onOpenMaintenanceDialog: () => void;
}

export function PrinterMaintenanceTab({ 
  printerId, 
  maintenanceLogs, 
  onOpenMaintenanceDialog 
}: PrinterMaintenanceTabProps) {
  // Filter logs for this printer using either printerId or printer_id
  const filteredLogs = maintenanceLogs.filter(log => 
    log.printer_id === printerId || log.printerId === printerId
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Maintenance History</h3>
        <Button size="sm" onClick={onOpenMaintenanceDialog}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Log
        </Button>
      </div>
      
      {filteredLogs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No maintenance logs found.</p>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex border-b py-3">
              <div className="flex-1">
                <h4 className="font-medium">{format(new Date(log.date), 'PP')}</h4>
                <p className="text-sm text-muted-foreground">{log.notes}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-muted-foreground">By: {log.performed_by || log.performedBy}</p>
                {log.scheduled && log.scheduled_date && (
                  <p className="text-xs mt-1">
                    Scheduled: {format(new Date(log.scheduled_date), 'PP')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
