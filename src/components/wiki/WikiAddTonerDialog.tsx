
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toner } from "@/types/types";

interface WikiAddTonerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  editToner?: Toner | null;
}

export const WikiAddTonerDialog: React.FC<WikiAddTonerDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  editToner,
}) => {
  const [toner, setToner] = useState<Omit<Toner, "id"|"created_at"|"updated_at">>({
    brand: editToner?.brand || "",
    model: editToner?.model || "",
    color: editToner?.color || "black",
    page_yield: editToner?.page_yield || 0,
    stock: editToner?.stock || 0,
    threshold: editToner?.threshold || 2,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Implementation will call prop onSave (parent fetchToners)
    onSave();
    setSaving(false);
    setToner({ brand: "", model: "", color: "black", page_yield: 0, stock: 0, threshold: 2 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editToner ? "Edit Toner" : "Add Toner"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-2 py-2" onSubmit={handleSave}>
          <div>
            <label className="text-sm">Brand*</label>
            <Input value={toner.brand} onChange={e => setToner(f => ({ ...f, brand: e.target.value }))} required />
          </div>
          <div>
            <label className="text-sm">Model*</label>
            <Input value={toner.model} onChange={e => setToner(f => ({ ...f, model: e.target.value }))} required />
          </div>
          <div>
            <label className="text-sm">Color*</label>
            <Input value={toner.color} onChange={e => setToner(f => ({ ...f, color: e.target.value }))} required />
          </div>
          <div>
            <label className="text-sm">Page Yield*</label>
            <Input type="number" value={toner.page_yield} onChange={e => setToner(f => ({ ...f, page_yield: Number(e.target.value) }))} required />
          </div>
          <div>
            <label className="text-sm">Stock*</label>
            <Input type="number" value={toner.stock} onChange={e => setToner(f => ({ ...f, stock: Number(e.target.value) }))} required />
          </div>
          <div>
            <label className="text-sm">Alert Threshold*</label>
            <Input type="number" value={toner.threshold} onChange={e => setToner(f => ({ ...f, threshold: Number(e.target.value) }))} required />
          </div>
          <DialogFooter className="gap-2 pt-4">
            <Button type="submit" variant="default" disabled={saving}>Save</Button>
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
