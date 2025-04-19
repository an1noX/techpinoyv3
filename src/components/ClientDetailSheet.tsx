import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Client, Printer } from '@/types';

export interface ClientDetailSheetProps {
  open: boolean;
  onOpenChange: () => void;
  client: Client;
  printers: Printer[];
}

export function ClientDetailSheet({
  open,
  onOpenChange,
  client,
  printers
}: ClientDetailSheetProps) {
  const assignedPrinters = printers.filter(printer => printer.clientId === client.id);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{client.name}</SheetTitle>
        </SheetHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right text-sm font-medium leading-none text-right">
              Name
            </label>
            <div className="col-span-3">{client.name}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="company" className="text-right text-sm font-medium leading-none">
              Company
            </label>
            <div className="col-span-3">{client.company}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="email" className="text-right text-sm font-medium leading-none">
              Email
            </label>
            <div className="col-span-3">{client.email}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="phone" className="text-right text-sm font-medium leading-none">
              Phone
            </label>
            <div className="col-span-3">{client.phone}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="address" className="text-right text-sm font-medium leading-none">
              Address
            </label>
            <div className="col-span-3">{client.address}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="notes" className="text-right text-sm font-medium leading-none">
              Notes
            </label>
            <div className="col-span-3">{client.notes}</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Assigned Printers</h3>
          {assignedPrinters.length > 0 ? (
            <ul>
              {assignedPrinters.map(printer => (
                <li key={printer.id} className="mb-1">
                  {printer.make} {printer.model} (Status: {printer.status})
                </li>
              ))}
            </ul>
          ) : (
            <p>No printers assigned to this client.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
