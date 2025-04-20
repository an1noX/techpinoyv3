
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TransferLogType } from '@/types/types';
import { Department } from '@/types/printers';

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printerId: string;
  printerModel: string;
  currentClient?: string;
  currentClientId?: string;
  currentDepartment?: string;
  currentDepartmentId?: string;
  currentUser?: string;
  currentUserId?: string;
  clients: Array<{ id: string; name: string }>;
  departments: Department[];
  users: Array<{ id: string; name: string }>;
  onTransfer: (transferLog: TransferLogType) => void;
}

export function TransferDialog({
  open,
  onOpenChange,
  printerId,
  printerModel,
  currentClient,
  currentClientId,
  currentDepartment,
  currentDepartmentId,
  currentUser,
  currentUserId,
  clients,
  departments,
  users,
  onTransfer,
}: TransferDialogProps) {
  const [toClientId, setToClientId] = useState<string>('');
  const [toDepartmentId, setToDepartmentId] = useState<string>('');
  const [toUserId, setToUserId] = useState<string>('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    // Find the client, department, and user names from their IDs
    const toClient = clients.find(client => client.id === toClientId)?.name;
    const toDepartment = departments.find(dept => dept.id === toDepartmentId)?.name;
    const toUser = users.find(user => user.id === toUserId)?.name;

    const transferLog: TransferLogType = {
      id: crypto.randomUUID(),
      printerId,
      printerModel,
      fromClient: currentClient,
      fromClientId: currentClientId,
      fromDepartment: currentDepartment,
      fromDepartmentId: currentDepartmentId,
      fromUser: currentUser,
      fromUserId: currentUserId,
      toClient,
      toClientId,
      toDepartment,
      toDepartmentId,
      toUser,
      toUserId,
      date: new Date().toISOString(),
      notes,
      transferredBy: 'Current User', // Ideally this would come from auth context
    };

    onTransfer(transferLog);
    resetForm();
  };

  const resetForm = () => {
    setToClientId('');
    setToDepartmentId('');
    setToUserId('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Printer</DialogTitle>
          <DialogDescription>
            Transfer this printer to a new client, department, or user.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="client">Transfer to Client</Label>
            <Select value={toClientId} onValueChange={setToClientId}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="department">Transfer to Department</Label>
            <Select value={toDepartmentId} onValueChange={setToDepartmentId}>
              <SelectTrigger id="department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="user">Assign to User</Label>
            <Select value={toUserId} onValueChange={setToUserId}>
              <SelectTrigger id="user">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Transfer Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this transfer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={!toClientId && !toDepartmentId && !toUserId}
          >
            Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
