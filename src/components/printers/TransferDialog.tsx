import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransferLogType } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface Department {
  id: string;
  name: string;
  client_id?: string;
}

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
  onTransfer,
}: TransferDialogProps) {
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [notes, setNotes] = useState("");

  const filteredDepartments = selectedClientId
    ? departments.filter((dept) => dept.client_id === selectedClientId)
    : departments;

  const handleReset = () => {
    setSelectedClientId("");
    setSelectedDepartmentId("");
    setSelectedUserId("");
    setNotes("");
  };

  const handleTransfer = () => {
    const selectedClient = clients.find((c) => c.id === selectedClientId);
    const selectedDepartment = departments.find((d) => d.id === selectedDepartmentId);
    const selectedUser = users.find((u) => u.id === selectedUserId);

    const transferLog: TransferLogType = {
      id: crypto.randomUUID(),
      printer_id: printerId,
      printerId: printerId,
      printer_model: printerModel,
      from_client: currentClient,
      fromClient: currentClient,
      from_client_id: currentClientId,
      fromClientId: currentClientId,
      from_department: currentDepartment,
      fromDepartment: currentDepartment,
      from_department_id: currentDepartmentId,
      fromDepartmentId: currentDepartmentId,
      from_user: currentUser,
      fromUser: currentUser,
      from_user_id: currentUserId,
      fromUserId: currentUserId,
      to_client: selectedClient?.name,
      toClient: selectedClient?.name,
      to_client_id: selectedClientId,
      toClientId: selectedClientId,
      to_department: selectedDepartment?.name,
      toDepartment: selectedDepartment?.name,
      to_department_id: selectedDepartmentId,
      toDepartmentId: selectedDepartmentId,
      to_user: selectedUser?.name,
      toUser: selectedUser?.name,
      to_user_id: selectedUserId,
      toUserId: selectedUserId,
      date: new Date().toISOString(),
      notes: notes,
      transferred_by: "Current User",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onTransfer(transferLog);
    handleReset();
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="client" className="text-right">
              Client
            </Label>
            <div className="col-span-3">
              <Select
                value={selectedClientId}
                onValueChange={setSelectedClientId}
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
                value={selectedDepartmentId}
                onValueChange={setSelectedDepartmentId}
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
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!selectedClientId && !selectedDepartmentId && !selectedUserId}
          >
            Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
