
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PrinterStatus } from '@/types/printers';

interface PrinterStatusBadgeProps {
  status: PrinterStatus;
}

const getStatusColor = (status: PrinterStatus) => {
  switch (status) {
    case 'available': return 'bg-status-available text-white';
    case 'rented': return 'bg-status-rented text-black';
    case 'maintenance': return 'bg-status-maintenance text-white';
    case 'for_repair': return 'bg-status-maintenance text-white';
    case 'deployed': return 'bg-status-rented text-black';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatusEmoji = (status: PrinterStatus) => {
  switch (status) {
    case 'available': return '🟢';
    case 'rented': return '🟡';
    case 'maintenance': return '🔴';
    case 'for_repair': return '🔴';
    case 'deployed': return '🟡';
    default: return '⚪';
  }
};

export const PrinterStatusBadge: React.FC<PrinterStatusBadgeProps> = ({ status }) => {
  return (
    <Badge className={getStatusColor(status)}>
      {getStatusEmoji(status)} {status}
    </Badge>
  );
};

export { getStatusColor, getStatusEmoji };
