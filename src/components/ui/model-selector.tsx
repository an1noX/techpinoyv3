
import React, { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
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

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  models: string[];
  className?: string;
  placeholder?: string;
}

export function ModelSelector({ 
  value, 
  onChange, 
  models = [], 
  className,
  placeholder = "Select a model..."
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);

  // Ensure models is always an array
  const safeModels = Array.isArray(models) ? models : [];

  // If we receive an empty array, add a fallback message
  const displayModels = safeModels.length > 0 
    ? safeModels 
    : ['No models available'];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          {value ? value : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandEmpty>No models found.</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-y-auto">
            {displayModels.map((model) => (
              <CommandItem
                key={model}
                value={model}
                onSelect={() => {
                  // Only call onChange for actual models, not our fallback message
                  if (model !== 'No models available') {
                    onChange(model);
                    setOpen(false);
                  }
                }}
                disabled={model === 'No models available'}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === model ? "opacity-100" : "opacity-0"
                  )}
                />
                {model}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
