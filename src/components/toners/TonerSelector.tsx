
import React, { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TonerType } from '@/types/types';

export interface TonerSelectorProps {
  value: string;
  onChange: (value: string) => void;
  toners: TonerType[];
}

export function TonerSelector({ value, onChange, toners }: TonerSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedToner = toners.find((toner) => toner.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedToner ? selectedToner.model : "Select toner..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search toners..." />
          <CommandEmpty>No toner found.</CommandEmpty>
          <CommandGroup>
            {toners.map((toner) => (
              <CommandItem
                key={toner.id}
                value={toner.id}
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    value === toner.id ? "opacity-100" : "opacity-0"
                  }`}
                />
                {toner.model} {toner.color && `(${toner.color})`}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
