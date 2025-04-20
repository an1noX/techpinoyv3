
import React from 'react';
import { TransferLogType } from '@/types/types';

interface PrinterHistoryTabProps {
  transferLogs: TransferLogType[];
  printerId: string;
}

export function PrinterHistoryTab({ 
  transferLogs, 
  printerId 
}: PrinterHistoryTabProps) {
  const filteredLogs = transferLogs.filter(log => log.printerId === printerId);
  
  return (
    <div>
      <h3 className="font-medium mb-4">Transfer History</h3>
      
      {filteredLogs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No transfer history available.</p>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div key={log.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{new Date(log.date).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">
                    Transferred by: {log.transferredBy}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <p>From: {log.fromClient || 'N/A'} {log.fromDepartment ? `(${log.fromDepartment})` : ''}</p>
                <p>To: {log.toClient || 'N/A'} {log.toDepartment ? `(${log.toDepartment})` : ''}</p>
                {log.notes && <p className="mt-1 text-muted-foreground">{log.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
