
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Printer } from "@/types/types";
import { toBackendTransferLog } from "@/utils/typeHelpers";

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printer: Printer;
  onSuccess?: () => void;
}

export function TransferDialog({ 
  open, 
  onOpenChange, 
  printer, 
  onSuccess 
}: TransferDialogProps) {
  const { toast } = useToast();
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [transferTo, setTransferTo] = useState<"client" | "department" | "user">("client");
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (open) {
      fetchClients();
      fetchDepartments();
      fetchUsers();
    }
  }, [open]);
  
  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("id, name")
      .order("name");
    
    if (!error && data) {
      setClients(data);
    }
  };
  
  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from("departments")
      .select("id, name");
    
    if (!error && data) {
      setDepartments(data);
    }
  };
  
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name");
    
    if (!error && data) {
      const formattedUsers = data.map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim() || user.id
      }));
      setUsers(formattedUsers);
    }
  };
  
  const handleTransfer = async () => {
    setSubmitting(true);
    
    try {
      // 1. Create transfer log
      const transferLog = {
        id: crypto.randomUUID(),
        printerId: printer.id,
        printer_id: printer.id,
        printer_model: `${printer.make} ${printer.model}`,
        from_client: printer.assigned_to || null,
        fromClient: printer.assigned_to || null,
        fromClientId: printer.client_id || null,
        to_client: transferTo === "client" ? clients.find(c => c.id === selectedClient)?.name || null : null,
        toClient: transferTo === "client" ? clients.find(c => c.id === selectedClient)?.name || null : null,
        toClientId: transferTo === "client" ? selectedClient : null,
        from_department: printer.department || null,
        fromDepartment: printer.department || null,
        fromDepartmentId: printer.department_id || null,
        to_department: transferTo === "department" ? departments.find(d => d.id === selectedDepartment)?.name || null : null,
        toDepartment: transferTo === "department" ? departments.find(d => d.id === selectedDepartment)?.name || null : null,
        toDepartmentId: transferTo === "department" ? selectedDepartment : null,
        from_user: null,
        fromUser: null,
        fromUserId: null,
        to_user: transferTo === "user" ? users.find(u => u.id === selectedUser)?.name || null : null,
        toUser: transferTo === "user" ? users.find(u => u.id === selectedUser)?.name || null : null,
        toUserId: transferTo === "user" ? selectedUser : null,
        transferred_by: "System", // Should be current user in a real implementation
        date: new Date().toISOString(),
        notes: `Transfer from ${printer.assigned_to || "Unassigned"} to ${
          transferTo === "client" ? clients.find(c => c.id === selectedClient)?.name : 
          transferTo === "department" ? departments.find(d => d.id === selectedDepartment)?.name : 
          users.find(u => u.id === selectedUser)?.name || "Unknown"
        }`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Convert to backend format
      const backendTransferLog = toBackendTransferLog(transferLog);
      
      const { error: transferError } = await supabase
        .from("transfer_logs")
        .insert(backendTransferLog);
      
      if (transferError) throw transferError;
      
      // 2. Update printer assignment
      const update: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      
      if (transferTo === "client") {
        update.client_id = selectedClient;
        update.assigned_to = clients.find(c => c.id === selectedClient)?.name || null;
        update.department = null;
        update.department_id = null;
      } else if (transferTo === "department") {
        update.department = departments.find(d => d.id === selectedDepartment)?.name || null;
        update.department_id = selectedDepartment;
      }
      
      const { error: updateError } = await supabase
        .from("printers")
        .update(update)
        .eq("id", printer.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Transfer successful",
        description: "Printer has been transferred successfully."
      });
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Transfer failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Printer</DialogTitle>
          <DialogDescription>
            Transfer this printer to a different client, department, or user.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Transfer To</Label>
            <Select 
              value={transferTo} 
              onValueChange={(value: "client" | "department" | "user") => {
                setTransferTo(value);
                setSelectedClient("");
                setSelectedDepartment("");
                setSelectedUser("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transfer type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {transferTo === "client" && (
            <div>
              <Label>Select Client</Label>
              <Select 
                value={selectedClient}
                onValueChange={setSelectedClient}
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
          )}
          
          {transferTo === "department" && (
            <div>
              <Label>Select Department</Label>
              <Select 
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger>
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
          )}
          
          {transferTo === "user" && (
            <div>
              <Label>Select User</Label>
              <Select 
                value={selectedUser}
                onValueChange={setSelectedUser}
              >
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
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleTransfer}
            disabled={submitting || (
              (transferTo === "client" && !selectedClient) ||
              (transferTo === "department" && !selectedDepartment) ||
              (transferTo === "user" && !selectedUser)
            )}
          >
            {submitting ? "Transferring..." : "Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
