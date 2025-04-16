
import React from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Fab } from '@/components/ui/fab';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockPrinters = [
  { id: '1', make: 'HP', series: 'LaserJet', model: 'Pro MFP M428fdn' },
  { id: '2', make: 'Brother', series: 'MFC', model: 'L8900CDW' },
  { id: '3', make: 'Canon', series: 'imageRUNNER', model: '1643i' },
  { id: '4', make: 'Xerox', series: 'VersaLink', model: 'C505' },
  { id: '5', make: 'Epson', series: 'WorkForce', model: 'Pro WF-C579R' },
];

export default function Wiki() {
  return (
    <MobileLayout
      fab={<Fab aria-label="Add printer" />}
    >
      <div className="container px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Printer Wiki</h1>
        </div>
        
        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search printers..."
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {mockPrinters.map((printer) => (
            <Card key={printer.id} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">{printer.make} {printer.model}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">Series: {printer.series}</p>
                <div className="flex justify-between mt-2">
                  <Button variant="outline" size="sm">Details</Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <span className="sr-only">QR Code</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="6" height="6" x="3" y="3" rx="1" />
                      <rect width="6" height="6" x="15" y="3" rx="1" />
                      <rect width="6" height="6" x="3" y="15" rx="1" />
                      <path d="M15 15h.01" />
                      <path d="M21 15h.01" />
                      <path d="M21 21h.01" />
                      <path d="M15 21h.01" />
                      <path d="M21 21v-6" />
                      <path d="M15 21v-6" />
                      <path d="M15 15h6" />
                    </svg>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
