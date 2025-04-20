import React from 'react';
import { Building2, User } from 'lucide-react';
import { Printer, Client } from '@/types/printers';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PrinterLocationAssignmentProps {
  printer: Printer;
  clients: Client[];
  isEditing: boolean;
  editedPrinter: Partial<Printer>;
  onClientChange: (clientId: string) => void;
  onLocationChange: (field: 'department' | 'location', value: string) => void;
}

export function PrinterLocationAssignment({
  printer,
  clients,
  isEditing,
  editedPrinter,
  onClientChange,
  onLocationChange
}: PrinterLocationAssignmentProps) {
  return (
    <div>
      <div className="flex items-center">
        <Building2 className="h-5 w-5 mr-2 text-muted-foreground" />
        <h3 className="font-medium">Location & Assignment</h3>
      </div>
      <Separator className="my-2" />
      <div className="pl-7 space-y-4">
        {(isEditing || printer.owned_by === 'client') && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Assigned Client</span>
            {isEditing ? (
              <Select
                value={editedPrinter.client_id || printer.client_id || ''}
                onValueChange={onClientChange}
                disabled={editedPrinter.owned_by === 'system' || printer.owned_by === 'system'}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : printer.assigned_to ? (
              <Badge variant="outline" className="font-medium">
                <User className="h-3 w-3 mr-1" />
                {printer.assigned_to}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Unassigned
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Department</span>
          {isEditing ? (
            <Input
              value={editedPrinter.department || printer.department || ''}
              onChange={(e) => onLocationChange('department', e.target.value)}
              className="w-[180px]"
              placeholder="Enter department"
            />
          ) : (
            <span className="text-sm font-medium">{printer.department || '—'}</span>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Location</span>
          {isEditing ? (
            <Input
              value={editedPrinter.location || printer.location || ''}
              onChange={(e) => onLocationChange('location', e.target.value)}
              className="w-[180px]"
              placeholder="Enter location"
            />
          ) : (
            <span className="text-sm font-medium">{printer.location || '—'}</span>
          )}
        </div>
      </div>
    </div>
  );
}