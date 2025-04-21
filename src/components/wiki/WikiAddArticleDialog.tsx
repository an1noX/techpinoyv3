
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WikiArticle, WikiPrinter } from "@/types/types";

interface WikiAddArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (article: WikiArticle) => void;
  printers: WikiPrinter[];
  categories: string[];
}

export const WikiAddArticleDialog: React.FC<WikiAddArticleDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  printers,
  categories,
}) => {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [associatedWith, setAssociatedWith] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const article: WikiArticle = {
      id: `${Math.random()}`,
      title,
      tags,
      content,
      associatedWith,
      category,
    };
    onSave(article);
    setSaving(false);
    setTitle("");
    setTags([]);
    setAssociatedWith("");
    setCategory("");
    setContent("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Article</DialogTitle>
        </DialogHeader>
        <form className="space-y-2 py-2" onSubmit={handleSave}>
          <div>
            <label className="text-sm">Title*</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm">Tags (comma separated)</label>
            <Input
              value={tags.join(",")}
              onChange={e => setTags(e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
              placeholder="e.g. HP M402dn, PrinterKB"
            />
          </div>
          <div>
            <label className="text-sm">Associated With (optional)</label>
            <select
              className="w-full border rounded p-2"
              value={associatedWith}
              onChange={e => setAssociatedWith(e.target.value)}
            >
              <option value="">Select a printer...</option>
              {printers.map(pr => (
                <option key={pr.id} value={pr.model}>{`${pr.make} ${pr.model}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm">Category*</label>
            <select
              className="w-full border rounded p-2"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              <option value="">Select...</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm">Content*</label>
            <textarea
              className="w-full rounded border p-2 min-h-[90px]"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
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
