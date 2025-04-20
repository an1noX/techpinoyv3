
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TransferLogType } from '@/types/types';
import { Calendar, ArrowRightLeft, User, Building, Users } from 'lucide-react';

interface PrinterHistoryTabProps {
  transferLogs: TransferLogType[];
  printerId: string;
}

export function PrinterHistoryTab({ transferLogs, printerId }: PrinterHistoryTabProps) {
  // Filter logs for this printer and sort by date descending
  const filteredLogs = transferLogs
    .filter(log => log.printerId === printerId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (filteredLogs.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-muted-foreground">No transfer history available for this printer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Transfer History</h3>
      
      {filteredLogs.map((log) => (
        <Card key={log.id} className="overflow-hidden">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                {new Date(log.date).toLocaleDateString()}
              </CardTitle>
              <Badge variant="outline" className="font-normal">
                Transfer
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="py-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium flex items-center">
                  <ArrowRightLeft className="h-4 w-4 mr-2 text-muted-foreground" />
                  From
                </h4>
                <div className="mt-2 space-y-1">
                  {log.fromClient && (
                    <p className="text-sm flex items-center">
                      <Building className="h-3 w-3 mr-2 text-muted-foreground" />
                      {log.fromClient}
                    </p>
                  )}
                  {log.fromDepartment && (
                    <p className="text-sm flex items-center">
                      <Users className="h-3 w-3 mr-2 text-muted-foreground" />
                      {log.fromDepartment}
                    </p>
                  )}
                  {log.fromUser && (
                    <p className="text-sm flex items-center">
                      <User className="h-3 w-3 mr-2 text-muted-foreground" />
                      {log.fromUser}
                    </p>
                  )}
                  {!log.fromClient && !log.fromDepartment && !log.fromUser && (
                    <p className="text-sm text-muted-foreground">Inventory</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium flex items-center">
                  <ArrowRightLeft className="h-4 w-4 mr-2 text-muted-foreground" />
                  To
                </h4>
                <div className="mt-2 space-y-1">
                  {log.toClient && (
                    <p className="text-sm flex items-center">
                      <Building className="h-3 w-3 mr-2 text-muted-foreground" />
                      {log.toClient}
                    </p>
                  )}
                  {log.toDepartment && (
                    <p className="text-sm flex items-center">
                      <Users className="h-3 w-3 mr-2 text-muted-foreground" />
                      {log.toDepartment}
                    </p>
                  )}
                  {log.toUser && (
                    <p className="text-sm flex items-center">
                      <User className="h-3 w-3 mr-2 text-muted-foreground" />
                      {log.toUser}
                    </p>
                  )}
                  {!log.toClient && !log.toDepartment && !log.toUser && (
                    <p className="text-sm text-muted-foreground">Inventory</p>
                  )}
                </div>
              </div>
            </div>
            
            {log.notes && (
              <div className="mt-4">
                <h4 className="text-sm font-medium">Notes</h4>
                <p className="text-sm mt-1 text-muted-foreground">{log.notes}</p>
              </div>
            )}
            
            <div className="mt-4 text-xs text-right text-muted-foreground">
              By: {log.transferredBy}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
