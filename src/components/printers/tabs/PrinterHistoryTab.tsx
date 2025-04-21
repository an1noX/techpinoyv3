
import { TransferLogType } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownUp, Building2, User2 } from "lucide-react";
import { toFrontendTransferLog } from "@/utils/typeHelpers";

interface PrinterHistoryTabProps {
  transferLogs: TransferLogType[];
  printerId: string;
}

export function PrinterHistoryTab({ transferLogs, printerId }: PrinterHistoryTabProps) {
  // Filter logs for this printer and sort by date (newest first)
  const filteredLogs = transferLogs
    .filter(log => log.printer_id === printerId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  if (filteredLogs.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">No transfer history available for this printer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Transfer History</h3>
      
      {filteredLogs.map((log) => (
        <Card key={log.id} className="overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowDownUp className="h-4 w-4" />
              <span>Transfer on {formatDate(log.date)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">From</h4>
                <div className="space-y-2">
                  {log.from_client && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{log.from_client}</span>
                    </div>
                  )}
                  {log.from_department && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{log.from_department}</span>
                    </div>
                  )}
                  {log.from_user && (
                    <div className="flex items-center gap-2">
                      <User2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{log.from_user}</span>
                    </div>
                  )}
                  {!log.from_client && !log.from_department && !log.from_user && (
                    <span className="text-sm text-muted-foreground">New printer</span>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">To</h4>
                <div className="space-y-2">
                  {log.to_client && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{log.to_client}</span>
                    </div>
                  )}
                  {log.to_department && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{log.to_department}</span>
                    </div>
                  )}
                  {log.to_user && (
                    <div className="flex items-center gap-2">
                      <User2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{log.to_user}</span>
                    </div>
                  )}
                  {!log.to_client && !log.to_department && !log.to_user && (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </div>
              </div>
            </div>
            
            {log.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm">{log.notes}</p>
              </div>
            )}
            
            <div className="mt-4 flex justify-between items-center">
              <Badge variant="outline" className="text-xs">
                Transferred by {log.transferred_by}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
