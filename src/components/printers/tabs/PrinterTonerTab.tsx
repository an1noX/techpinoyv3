
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PrinterType, WikiToner } from '@/types/types';
import { PlusCircle, XCircle } from 'lucide-react';

interface PrinterTonerTabProps {
  printer: PrinterType;
  toners: WikiToner[];
  onUpdate: (printer: PrinterType) => void;
}

export function PrinterTonerTab({ printer, toners, onUpdate }: PrinterTonerTabProps) {
  const [selectedToners, setSelectedToners] = useState<string[]>(printer.toners || []);
  
  const compatibleToners = toners.filter(toner => 
    selectedToners.includes(toner.id)
  );
  
  const handleUpdateToners = () => {
    onUpdate({
      ...printer,
      toners: selectedToners
    });
  };
  
  const handleRemoveToner = (tonerId: string) => {
    setSelectedToners(prev => prev.filter(id => id !== tonerId));
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Compatible Toners</h3>
        <Button size="sm" onClick={handleUpdateToners}>
          Update Toners
        </Button>
      </div>
      
      {compatibleToners.length === 0 ? (
        <p className="text-sm text-muted-foreground">No compatible toners assigned.</p>
      ) : (
        <div className="space-y-2">
          {compatibleToners.map((toner) => (
            <div key={toner.id} className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <p className="font-medium">{toner.brand} {toner.model}</p>
                <p className="text-sm text-muted-foreground">
                  {toner.color && <span className="capitalize">{toner.color} • </span>}
                  {toner.page_yield && <span>{toner.page_yield.toLocaleString()} pages</span>}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleRemoveToner(toner.id)}
              >
                <XCircle className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <h4 className="text-sm font-medium mb-2">Add Compatible Toner</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {toners
            .filter(toner => !selectedToners.includes(toner.id))
            .slice(0, 4)
            .map((toner) => (
              <Button 
                key={toner.id} 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedToners(prev => [...prev, toner.id])}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                {toner.brand} {toner.model}
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
}
