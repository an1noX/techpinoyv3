import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, CircleDollarSign, Wrench, BookText } from "lucide-react";

interface WikiEntryTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: 'printer' | 'toner' | 'article' | 'maintenance') => void;
}

export function WikiEntryTypeDialog({ open, onOpenChange, onSelect }: WikiEntryTypeDialogProps) {
  const entryTypes = [
    {
      id: 'printer',
      name: 'Printer',
      description: 'Add a new printer model with specifications',
      icon: Printer,
    },
    {
      id: 'toner',
      name: 'Toner',
      description: 'Add a new toner cartridge reference',
      icon: CircleDollarSign,
    },
    {
      id: 'article',
      name: 'Article',
      description: 'Create a general knowledge article',
      icon: BookText,
    },
    {
      id: 'maintenance',
      name: 'Maintenance Guide',
      description: 'Add maintenance procedures and tips',
      icon: Wrench,
    },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Entry Type</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          {entryTypes.map((type) => (
            <Button
              key={type.id}
              variant="outline"
              className="flex items-center justify-start gap-3 h-auto p-4"
              onClick={() => {
                onSelect(type.id);
                onOpenChange(false);
              }}
            >
              <type.icon className="h-5 w-5 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">{type.name}</div>
                <div className="text-sm text-muted-foreground">{type.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}