
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Printer } from "@/types/printers";

interface AssignPrinterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printer: Printer;
  onSuccess?: () => void;
}

export const AssignPrinterDialog: React.FC<AssignPrinterDialogProps> = ({
  open,
  onOpenChange,
  printer,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchClients();
      fetchDepartments();
      setSelectedClient("");
      setSelectedDepartment("");
    }
  }, [open]);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("id, name")
      .order("name");
    if (!error && data) setClients(data);
  };

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from("departments")
      .select("id, name");
    
    if (!error && data) setDepartments(data);
  };

  const filteredDepartments = selectedClient
    ? departments.filter((d) => d.id === selectedClient)
    : [];

  const handleAssign = async () => {
    if (!selectedClient) {
      toast({
        title: "Select a client",
        description: "Client is required to assign this printer.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("printers")
      .update({
        owned_by: "client",
        client_id: selectedClient,
        assigned_to: clients.find((c) => c.id === selectedClient)?.name || null,
        department: selectedDepartment || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", printer.id);
    setSubmitting(false);

    if (error) {
      toast({
        title: "Assignment failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Printer assigned",
        description: "Printer assigned to selected client.",
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign Printer</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => {e.preventDefault(); handleAssign();}}>
          <div className="mb-4">
            <Label>Client <span className="text-red-500">*</span></Label>
            <Select
              value={selectedClient}
              onValueChange={(val) => {
                setSelectedClient(val);
                setSelectedDepartment("");
              }}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem value={c.id} key={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground block mt-1">Clients are required to assign a printer. Departments available after client selection.</span>
          </div>
          {selectedClient && (
            <div className="mb-4">
              <Label>Department</Label>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {filteredDepartments.length === 0 ? (
                    <div className="text-xs px-3 py-2 text-muted-foreground">No departments for this client.</div>
                  ) : (
                    filteredDepartments.map((d) => (
                      <SelectItem value={d.id} key={d.id}>{d.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground block mt-1">Department is optional.</span>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting || !selectedClient}>{submitting ? "Assigning..." : "Assign"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
