import React, { useState } from 'react';
import { TransferLogType } from '@/types/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toBackendTransferLog } from '@/utils/typeHelpers';

const transferFormSchema = z.object({
  toClient: z.string().optional(),
  toDepartment: z.string().optional(),
  toUser: z.string().optional(),
  notes: z.string().optional()
});

type TransferFormValues = z.infer<typeof transferFormSchema>;

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
  departments: Array<{ id: string; name: string, client_id?: string }>;
  users: Array<{ id: string; name: string }>;
  onTransfer: (log: TransferLogType) => void;
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
  onTransfer
}: TransferDialogProps) {
  const [filteredDepartments, setFilteredDepartments] = useState(departments);

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      toClient: '',
      toDepartment: '',
      toUser: '',
      notes: ''
    }
  });

  const onSubmit = (data: TransferFormValues) => {
    const transferLog: TransferLogType = {
      id: crypto.randomUUID(),
      printer_id: printerId,
      printer_model: printerModel,
      from_client: currentClient,
      from_client_id: currentClientId,
      from_department: currentDepartment,
      from_department_id: currentDepartmentId,
      from_user: currentUser,
      from_user_id: currentUserId,
      to_client: clients.find(c => c.id === data.toClient)?.name,
      to_client_id: data.toClient,
      to_department: departments.find(d => d.id === data.toDepartment)?.name,
      to_department_id: data.toDepartment,
      to_user: users.find(u => u.id === data.toUser)?.name,
      to_user_id: data.toUser,
      transferred_by: 'Admin User', // This should come from auth context in a real app
      date: new Date().toISOString(),
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      
      // Add frontend compatibility fields
      printerId,
      fromClient: currentClient,
      fromClientId: currentClientId,
      fromDepartment: currentDepartment,
      fromDepartmentId: currentDepartmentId,
      fromUser: currentUser,
      fromUserId: currentUserId,
      toClient: clients.find(c => c.id === data.toClient)?.name,
      toClientId: data.toClient,
      toDepartment: departments.find(d => d.id === data.toDepartment)?.name,
      toDepartmentId: data.toDepartment,
      toUser: users.find(u => u.id === data.toUser)?.name,
      toUserId: data.toUser
    };

    onTransfer(transferLog);
    onOpenChange(false);
    form.reset();
  };

  // Filter departments when client selection changes
  const handleClientChange = (value: string) => {
    form.setValue('toClient', value);
    form.setValue('toDepartment', ''); // Reset department when client changes
    
    if (value) {
      const filtered = departments.filter(dept => dept.client_id === value);
      setFilteredDepartments(filtered);
    } else {
      setFilteredDepartments(departments);
    }
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">
                  Client
                </Label>
                <div className="col-span-3">
                  <Select
                    value={form.watch('toClient')}
                    onValueChange={handleClientChange}
                  >
                    <SelectTrigger>
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
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Department
                </Label>
                <div className="col-span-3">
                  <Select
                    value={form.watch('toDepartment')}
                    onValueChange={form.setValue('toDepartment')}
                    disabled={filteredDepartments.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDepartments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user" className="text-right">
                  Assign To
                </Label>
                <div className="col-span-3">
                  <Select value={form.watch('toUser')} onValueChange={form.setValue('toUser')}>
                    <SelectTrigger>
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
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  className="col-span-3"
                  placeholder="Add transfer notes..."
                  value={form.watch('notes')}
                  onChange={(e) => form.setValue('notes', e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!form.watch('toClient') && !form.watch('toDepartment') && !form.watch('toUser')}
              >
                Transfer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
