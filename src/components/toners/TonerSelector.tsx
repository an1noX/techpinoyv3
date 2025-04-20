
import React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface TonerOption {
  id: string;
  name: string;
}

interface TonerSelectorProps {
  toners: TonerOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TonerSelector({
  toners,
  value,
  onChange,
  placeholder = 'Select toner...',
}: TonerSelectorProps) {
  const [open, setOpen] = React.useState(false);
  
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
          {value ? selectedToner?.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search toners..." />
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
        </Command>
      </PopoverContent>
    </Popover>
  );
}
