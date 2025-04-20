
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { PrinterStatus as StatusType } from "@/types/printers";

interface PrinterStatusProps {
  status: StatusType;
  className?: string;
  showLabel?: boolean;
}

export function PrinterStatus({ status, className, showLabel = true }: PrinterStatusProps) {
  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 hover:bg-green-600';
      case 'rented':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'maintenance':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-slate-500 hover:bg-slate-600';
    }
  };

  const getStatusEmoji = (status: StatusType) => {
    switch (status) {
      case 'available':
        return '🟢';
      case 'rented':
        return '🟡';
      case 'maintenance':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} ${className}`}>
      <span className="mr-1">{getStatusEmoji(status)}</span>
      {showLabel && <span className="capitalize">{status}</span>}
    </Badge>
  );
}
