import React, { useState, useEffect } from "react";
import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/ui/button";
import { Printer } from "@/types/printers";
import { Info, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WikiPrinter {
  id: string;
  make: string;
  series: string;
  model: string;
  type?: string;
  description?: string;
  toners?: string[]; // for possible direct reference
}

interface Toner {
  id: string;
  model: string; // Changed from 'name' to 'model' to match database schema
  oem_code?: string;
  brand?: string; // Added to match database schema
  color?: string;
}

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
  // State for local edits
  const [editMode, setEditMode] = useState(false);
  const [serial, setSerial] = useState(printer.serialNumber || "");
  const [ownership, setOwnership] = useState(printer.owned_by);
  const [assignedTo, setAssignedTo] = useState(printer.assigned_to || "");
  const [department, setDepartment] = useState(printer.department || "");

  // Wiki info state
  const [wikiPrinter, setWikiPrinter] = useState<WikiPrinter | null>(null);
  const [wikiToners, setWikiToners] = useState<Toner[]>([]);
  const [wikiLoading, setWikiLoading] = useState(false);

  // When dialog is opened, fetch related Wiki data
  useEffect(() => {
    if (!open) return;
    setWikiPrinter(null);
    setWikiToners([]);
    setWikiLoading(true);

    async function fetchWikiData() {
      // 1. Find wiki_printers by make and model
      const { data: wiki, error } = await supabase
        .from("wiki_printers")
        .select("*")
        .eq("make", printer.make)
        .eq("model", printer.model)
        .maybeSingle();

      if (!wiki || error) {
        setWikiPrinter(null);
        setWikiToners([]);
        setWikiLoading(false);
        return;
      }

      setWikiPrinter(wiki as WikiPrinter);

      // 2. Find toners compatible with this wiki printer
      const { data: compatibility, error: compatErr } = await supabase
        .from("printer_toner_compatibility")
        .select("toner_id")
        .eq("printer_wiki_id", wiki.id);

      if (!compatibility || compatErr || compatibility.length === 0) {
        setWikiToners([]);
        setWikiLoading(false);
        return;
      }

      const tonerIds = compatibility.map((c) => c.toner_id);

      // 3. Get toner details for these toner ids
      const { data: toners, error: tonersErr } = await supabase
        .from("wiki_toners")
        .select("*")
        .in("id", tonerIds);

      if (!toners || tonersErr) {
        setWikiToners([]);
      } else {
        setWikiToners(toners);
      }

      setWikiLoading(false);
    }

    fetchWikiData();
  }, [open, printer.make, printer.model]);

  // When changing ownership, refresh assignment fields
  const handleOwnershipChange = (val: "client" | "system") => {
    setOwnership(val);
    if (val === "client") {
      setDepartment("");
    } else {
      setAssignedTo("");
    }
  };

  const handleSave = () => {
    setEditMode(false);
    // would call parent's onUpdate or a mutation here
  };

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
        {/* General info (from Wiki, readonly) */}
        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="text-base font-semibold mb-2">General Information (from Wiki)</h3>
          {wikiLoading ? (
            <div className="text-gray-500 text-sm">Loading Wiki info…</div>
          ) : wikiPrinter ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Make: </span>
                <span>{wikiPrinter.make}</span>
              </div>
              <div>
                <span className="font-medium">Model: </span>
                <span>{wikiPrinter.model}</span>
              </div>
              <div>
                <span className="font-medium">Series: </span>
                <span>{wikiPrinter.series}</span>
              </div>
              <div>
                <span className="font-medium">Type: </span>
                <span>{wikiPrinter.type || "N/A"}</span>
              </div>
              <div className="col-span-2 mt-2">
                <span className="font-medium">Description: </span>
                <span>{wikiPrinter.description || "—"}</span>
              </div>
              <div className="col-span-2 mt-2">
                <span className="font-medium">Compatible Toners: </span>
                {wikiToners.length === 0 ? (
                  <span>No compatible toners registered.</span>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {wikiToners.map((t) => (
                      <span
                        key={t.id}
                        className="inline-block text-xs px-2 py-0.5 bg-blue-100 text-blue-900 rounded"
                        title={`OEM: ${t.oem_code || ""}${t.model ? ` (${t.model})` : ""}`}
                      >
                        {t.brand && `${t.brand} `}{t.model}{t.color ? ` (${t.color})` : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-red-500 text-sm">
              Wiki entry not found for <b>{printer.make} {printer.model}</b>.
              <br />Please check the Wiki for this model.
            </div>
          )}
        </div>

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
            <p>This view shows the current <b>printer general information from the Wiki</b>. Only assignments and inventory fields are editable here. General specs and compatible toners are centrally managed in the Wiki.</p>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};
