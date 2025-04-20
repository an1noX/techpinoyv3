
import React from 'react';
import { Button } from '@/components/ui/button';
import { MaintenanceLogType } from '@/types/types';
import { PlusCircle } from 'lucide-react';

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
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Maintenance History</h3>
        <Button size="sm" onClick={onOpenMaintenanceDialog}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Log
        </Button>
      </div>
      
      {maintenanceLogs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No maintenance logs found.</p>
      ) : (
        <div className="space-y-4">
          {maintenanceLogs.map((log) => (
            <div key={log.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{new Date(log.date).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">Performed by: {log.performedBy}</p>
                </div>
                {log.scheduled && (
                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Scheduled
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm">{log.notes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
