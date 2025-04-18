
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PrinterStatus } from '@/types';
import { 
  rpcLogPrinterAction
} from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PrinterStatusBadgeProps {
  status: PrinterStatus;
  printerId?: string;
  onStatusChange?: (newStatus: PrinterStatus) => void;
  clickable?: boolean;
}

export function PrinterStatusBadge({ 
  status, 
  printerId, 
  onStatusChange,
  clickable = false 
}: PrinterStatusBadgeProps) {
  const { toast } = useToast();

  const getStatusColor = (status: PrinterStatus) => {
    switch (status) {
      case 'available': return 'bg-status-available text-white';
      case 'rented': return 'bg-status-rented text-black';
      case 'maintenance': return 'bg-status-maintenance text-white';
      case 'deployed': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusEmoji = (status: PrinterStatus) => {
    switch (status) {
      case 'available': return '🟢';
      case 'rented': return '🟡';
      case 'maintenance': return '🔴';
      case 'deployed': return '🔵';
      default: return '⚪';
    }
  };

  const logStatusChange = async (oldStatus: PrinterStatus, newStatus: PrinterStatus) => {
    try {
      if (!printerId) return;
      
      const { data, error } = await rpcLogPrinterAction(
        'printer',
        printerId,
        'status_change',
        { from: oldStatus, to: newStatus }
      );
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error logging status change",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleClick = () => {
    if (!clickable || !onStatusChange) return;
    
    let newStatus: PrinterStatus;
    
    switch (status) {
      case 'available': 
        newStatus = 'deployed';
        break;
      case 'deployed':
        newStatus = 'available';
        break;
      case 'rented':
        newStatus = 'available';
        break;
      case 'maintenance':
        newStatus = 'available';
        break;
      default:
        newStatus = 'available';
    }
    
    logStatusChange(status, newStatus);
    onStatusChange(newStatus);
  };

  return (
    <Badge 
      className={`${getStatusColor(status)} ${clickable ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {getStatusEmoji(status)} {status}
    </Badge>
  );
}
