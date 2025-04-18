
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CheckCircle2, AlertCircle, Clock, Building2 } from 'lucide-react';
import { PrinterStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PrinterStatusBadgeProps {
  printerId: string;
  currentStatus: PrinterStatus;
  onStatusChange: (newStatus: PrinterStatus) => void;
}

const getStatusDetails = (status: PrinterStatus) => {
  switch (status) {
    case 'available':
      return { color: 'bg-green-500', icon: CheckCircle2, label: 'Available' };
    case 'rented':
      return { color: 'bg-blue-500', icon: Clock, label: 'Rented' };
    case 'maintenance':
      return { color: 'bg-red-500', icon: AlertCircle, label: 'Maintenance' };
    case 'deployed':
      return { color: 'bg-purple-500', icon: Building2, label: 'Deployed' };
    default:
      return { color: 'bg-gray-500', icon: CheckCircle2, label: status };
  }
};

export const PrinterStatusBadge = ({ printerId, currentStatus, onStatusChange }: PrinterStatusBadgeProps) => {
  const { toast } = useToast();
  const { color, icon: Icon, label } = getStatusDetails(currentStatus);

  const handleStatusChange = async (newStatus: PrinterStatus) => {
    try {
      // First update the printer's status
      const { error: updateError } = await supabase
        .from('printers')
        .update({ status: newStatus })
        .eq('id', printerId);

      if (updateError) throw updateError;

      // Then add an audit log entry (using regular insert since we don't have an RPC for this yet)
      const { error: logError } = await supabase
        .from('printer_audit_logs')
        .insert({
          printer_id: printerId,
          changed_by: 'system',
          old_status: currentStatus,
          new_status: newStatus
        });

      if (logError) {
        console.error("Error logging status change:", logError);
        // Continue even if logging fails
      }

      onStatusChange(newStatus);
      
      toast({
        title: "Status updated",
        description: `Printer status changed to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge className={`cursor-pointer ${color} text-white`}>
          <Icon className="w-4 h-4 mr-1" />
          {label}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleStatusChange('available')}>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Available
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('rented')}>
          <Clock className="w-4 h-4 mr-2" />
          Rented
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('maintenance')}>
          <AlertCircle className="w-4 h-4 mr-2" />
          Maintenance
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('deployed')}>
          <Building2 className="w-4 h-4 mr-2" />
          Deployed
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
