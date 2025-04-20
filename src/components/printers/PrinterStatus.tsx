
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PrinterStatus as PrinterStatusType } from '@/types/printers';

interface PrinterStatusProps {
  status: PrinterStatusType | 'maintenance' | 'repair' | 'pending' | 'in_progress' | 'completed' | 'unrepairable' | 'decommissioned';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PrinterStatus({ status, showIcon = true, size = 'md' }: PrinterStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500 text-white';
      case 'rented': return 'bg-yellow-500 text-black';
      case 'maintenance': return 'bg-blue-500 text-white';
      case 'repair': return 'bg-red-500 text-white';
      case 'pending': return 'bg-yellow-500 text-black';
      case 'in_progress': return 'bg-blue-500 text-white';
      case 'completed': return 'bg-green-500 text-white';
      case 'unrepairable': return 'bg-red-500 text-white';
      case 'decommissioned': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'available': return '🟢';
      case 'rented': return '🟡';
      case 'maintenance': return '🔷';
      case 'repair': return '🔴';
      case 'pending': return '⏳';
      case 'in_progress': return '🔧';
      case 'completed': return '✅';
      case 'unrepairable': return '❌';
      case 'decommissioned': return '⚫';
      default: return '⚪';
    }
  };

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'px-3 py-1'
  }[size];

  const formattedStatus = status.replace('_', ' ');

  return (
    <Badge className={`${getStatusColor(status)} ${sizeClass}`}>
      {showIcon && <span className="mr-1">{getStatusEmoji(status)}</span>}
      {formattedStatus}
    </Badge>
  );
}

export default PrinterStatus;
