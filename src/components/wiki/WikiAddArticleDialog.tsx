
import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WikiArticle, WikiPrinter } from "@/types/types";

// New: For visually representing tags as "chips"
function TagChips({ tags, onRemove }: { tags: string[]; onRemove: (tag: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 mb-2">
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="inline-flex items-center bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs mr-1 mb-1"
        >
          {tag}
          <button
            type="button"
            className="ml-1 text-red-600 hover:text-red-800"
            onClick={() => onRemove(tag)}
            aria-label={`Remove tag ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

interface WikiAddArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (article: WikiArticle & { videoUrl?: string }) => void;
  printers: WikiPrinter[];
  categories: string[];
  setCategories: (cats: string[]) => void;
}

export const WikiAddArticleDialog: React.FC<WikiAddArticleDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  printers,
  categories,
  setCategories,
}) => {
  const [title, setTitle] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedMake, setSelectedMake] = useState("");
  const [makeModels, setMakeModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // Compute all unique Makes and Models from printers data
  const makes = useMemo(() => Array.from(new Set(printers.map(p => p.make))), [printers]);
  // When selectedMake changes, update models.
  useMemo(() => {
    if (selectedMake) {
      setMakeModels(printers.filter(p => p.make === selectedMake).map(p => p.model));
    } else {
      setMakeModels([]);
    }
    setSelectedModel("");
  }, [selectedMake, printers]);

  // Add tag chip if comma or enter pressed or Add button clicked
  const addTag = (value?: string) => {
    let raw = typeof value === "string" ? value : tagInput;
    const tagList: string[] = raw.split(",").map(t => t.trim()).filter(Boolean);
    setTags(prev => Array.from(new Set([...prev, ...tagList])));
    setTagInput("");
  };
  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleCategoryAdd = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setCategory(newCategory.trim());
      setNewCategory("");
      setAddingCategory(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const article: WikiArticle & { videoUrl?: string } = {
      id: `${Math.random()}`,
      title,
      tags,
      content,
      associatedWith: selectedModel,
      category,
      ...(videoUrl && { videoUrl }),
    };
    onSave(article);
    setSaving(false);
    setTitle("");
    setTags([]);
    setTagInput("");
    setSelectedMake("");
    setSelectedModel("");
    setCategory("");
    setNewCategory("");
    setAddingCategory(false);
    setContent("");
    setVideoUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Article</DialogTitle>
        </DialogHeader>
        <form className="space-y-2 py-2" onSubmit={handleSave}>
          <div>
            <label className="text-sm">Title*</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm">Tags*</label>
            <TagChips tags={tags} onRemove={removeTag} />
            <div className="flex gap-2">
              <Input
                className="flex-1"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Type and press enter or comma..."
              />
              <Button type="button" variant="outline" onClick={() => addTag()} disabled={!tagInput}>Add</Button>
            </div>
          </div>
          <div>
            <label className="text-sm">Associate with Printer (optional)</label>
            <div className="flex gap-2">
              {/* Make selection */}
              <select
                className="w-1/2 border rounded p-2"
                value={selectedMake}
                onChange={e => setSelectedMake(e.target.value)}
              >
                <option value="">Select Make...</option>
                {makes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
              {/* Model selection, dependent */}
              <select
                className="w-1/2 border rounded p-2"
                value={selectedModel}
                disabled={!selectedMake}
                onChange={e => setSelectedModel(e.target.value)}
              >
                <option value="">Select Model...</option>
                {makeModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm">Category*</label>
            <div className="flex gap-2">
              <select
                className="w-full border rounded p-2"
                value={category}
                required
                onChange={e => {
                  if (e.target.value === "__add_new__") {
                    setAddingCategory(true);
                  } else {
                    setCategory(e.target.value);
                  }
                }}
              >
                <option value="">Select...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__add_new__">+ Add new category</option>
              </select>
            </div>
            {addingCategory && (
              <div className="mt-2 flex gap-2">
                <Input
                  autoFocus
                  value={newCategory}
                  placeholder="New category name"
                  onChange={e => setNewCategory(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="default" onClick={handleCategoryAdd} disabled={!newCategory.trim()}>
                  Add
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setNewCategory(""); setAddingCategory(false); }}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
          <div>
            <label className="text-sm">YouTube Video Link (optional)</label>
            <Input
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              type="url"
              inputMode="url"
            />
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
