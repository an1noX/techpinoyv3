
import React, { useState } from "react";
import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/ui/button";
import { Printer } from "@/types/printers";
import { Info, Edit } from "lucide-react";

interface PrinterDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printer: Printer;
}

export const PrinterDetailsDialog: React.FC<PrinterDetailsDialogProps> = ({
  open,
  onOpenChange,
  printer,
}) => {
  // EDIT MODE state & update logic for serial, ownership, client, department
  const [editMode, setEditMode] = useState(false);
  const [serial, setSerial] = useState(printer.serialNumber || "");
  const [ownership, setOwnership] = useState(printer.owned_by);
  const [assignedTo, setAssignedTo] = useState(printer.assigned_to || "");
  const [department, setDepartment] = useState(printer.department || "");

  // When changing ownership, refresh assignment fields
  const handleOwnershipChange = (val: "client" | "system") => {
    setOwnership(val);
    if (val === "client") {
      setDepartment("");
    } else {
      setAssignedTo("");
    }
  };

  // On Save (simulate API call, will use props update in real API)
  const handleSave = () => {
    // Simulate save action
    setEditMode(false);
    // would call parent's onUpdate or a mutation here
  };

  // Toner name (placeholder until mapped from real data)
  const tonerName = "TONER NAME";

  // Ownership label for display
  const getOwnershipLabel = (val: "client" | "system") =>
    val === "client" ? "Client Owned" : "System Unit";

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Printer Details – ${printer.make} ${printer.model}`}
      size="sm"
      footer={
        <div className="flex justify-between items-center">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </>
          ) : (
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          )}
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold">
            {printer.make} {printer.model}
            <span className="ml-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
              {getOwnershipLabel(ownership)}
            </span>
          </h2>
          {!editMode && (
            <Button
              size="icon"
              variant="outline"
              className="ml-2"
              onClick={() => setEditMode(true)}
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 border rounded-md p-4 bg-gray-50">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Serial Number</p>
            {editMode ? (
              <input
                value={serial}
                onChange={e => setSerial(e.target.value)}
                className="border rounded px-2 py-0.5 w-full text-sm"
              />
            ) : (
              <p>{serial || "N/A"}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Toner Name</p>
            <p>{tonerName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Ownership</p>
            {editMode ? (
              <select
                value={ownership}
                onChange={e => handleOwnershipChange(e.target.value as "client" | "system")}
                className="border rounded px-2 py-0.5 w-full text-sm"
              >
                <option value="system">System Unit</option>
                <option value="client">Client Owned</option>
              </select>
            ) : (
              <p>{getOwnershipLabel(ownership)}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Department</p>
            {editMode && ownership === "system" ? (
              <input
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="border rounded px-2 py-0.5 w-full text-sm capitalize"
              />
            ) : (
              <p className="capitalize">{department || "N/A"}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Client</p>
            {editMode && ownership === "client" ? (
              <input
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                className="border rounded px-2 py-0.5 w-full text-sm capitalize"
              />
            ) : (
              <p className="capitalize">{assignedTo || "N/A"}</p>
            )}
          </div>
        </div>

        {printer.notes && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
            <div className="border rounded-md p-3 bg-white whitespace-pre-line">
              {printer.notes}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-center">
          <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-sm border border-blue-200 flex items-start gap-2 max-w-md">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p>This view shows the current information for this printer. Use the History view to see past maintenance records, transfers, and other activities.</p>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};
