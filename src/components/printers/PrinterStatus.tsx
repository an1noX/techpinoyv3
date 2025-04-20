
import React from 'react';
import { Badge } from '@/components/ui/badge';

type StatusType = 'active' | 'inactive' | 'maintenance' | 'decommissioned';

interface PrinterStatusProps {
  status: StatusType;
}

export function PrinterStatus({ status }: PrinterStatusProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'maintenance':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'decommissioned':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'maintenance':
        return 'Maintenance';
      case 'decommissioned':
        return 'Decommissioned';
      default:
        return 'Unknown';
    }
  };

  return (
    <Badge variant="outline" className={`${getStatusStyles()} capitalize`}>
      {getStatusLabel()}
    </Badge>
  );
}
