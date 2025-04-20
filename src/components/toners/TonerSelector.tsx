
import React, { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TonerType } from '@/types/types';

interface TonerOption {
  id: string;
  name: string;
}

export interface TonerSelectorProps {
  toners: TonerOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onAddToner?: (toner: TonerType) => void;
}

export function TonerSelector({
  toners,
  value,
  onChange,
  placeholder = 'Select toner...',
  onAddToner
}: TonerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTonerName, setNewTonerName] = useState('');
  
  const selectedToner = toners.find((toner) => toner.id === value);

  const handleAddNewToner = () => {
    if (onAddToner && newTonerName.trim()) {
      const newToner: TonerType = {
        id: crypto.randomUUID(),
        name: newTonerName.trim(),
        model: newTonerName.trim(),
        brand: '',
        color: '',
        page_yield: 0,
      };
      onAddToner(newToner);
      setNewTonerName('');
      setShowAddDialog(false);
      onChange(newToner.id);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value ? selectedToner?.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search toners..." />
            <CommandList>
              <CommandEmpty>No toner found.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {toners.map((toner) => (
                  <CommandItem
                    key={toner.id}
                    value={toner.id}
                    onSelect={() => {
                      onChange(toner.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === toner.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {toner.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              {onAddToner && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        setShowAddDialog(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add new toner
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {onAddToner && (
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Toner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="toner-name">Toner Name</Label>
                <Input
                  id="toner-name"
                  placeholder="Enter toner model or name"
                  value={newTonerName}
                  onChange={(e) => setNewTonerName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNewToner} disabled={!newTonerName.trim()}>
                Add Toner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
