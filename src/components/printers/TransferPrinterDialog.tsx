
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Printer } from "@/types/printers";

interface TransferPrinterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printer: Printer;
  onSuccess?: () => void;
}

export const TransferPrinterDialog: React.FC<TransferPrinterDialogProps> = ({
  open,
  onOpenChange,
  printer,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>(printer.client_id || "");
  const [selectedDepartment, setSelectedDepartment] = useState<string>(printer.department || "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchClients();
      fetchDepartments();
      setSelectedClient(printer.client_id || "");
      setSelectedDepartment(printer.department || "");
    }
  }, [open, printer]);

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

  const handleTransfer = async () => {
    setSubmitting(true);
    const update: Record<string, any> = {
      client_id: selectedClient,
      assigned_to: clients.find((c) => c.id === selectedClient)?.name || null,
      department: selectedDepartment || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("printers")
      .update(update)
      .eq("id", printer.id);
    setSubmitting(false);

    if (error) {
      toast({
        title: "Transfer failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Printer transferred",
        description: "Printer transferred to selected client/department.",
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Transfer Printer</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => {e.preventDefault(); handleTransfer();}}>
          <div className="mb-4">
            <Label>Client</Label>
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
            <span className="text-xs text-muted-foreground block mt-1">Changing client will clear department field.</span>
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
              <span className="text-xs text-muted-foreground block mt-1">Department field updates per selected client.</span>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Transferring..." : "Transfer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
