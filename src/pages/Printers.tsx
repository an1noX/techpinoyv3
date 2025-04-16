
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Fab } from '@/components/ui/fab';
import { Search, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer, PrinterStatus } from '@/types';

const mockPrinters: (Printer & { department: string, location: string })[] = [
  { 
    id: '1', 
    make: 'HP', 
    series: 'LaserJet', 
    model: 'Pro MFP M428fdn',
    status: 'available',
    ownedBy: 'system',
    department: 'Marketing',
    location: 'Floor 2, Room 201',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: '2', 
    make: 'Brother', 
    series: 'MFC', 
    model: 'L8900CDW',
    status: 'rented',
    ownedBy: 'system',
    assignedTo: 'Acme Corp',
    department: 'Sales',
    location: 'Floor 1, Room 105',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: '3', 
    make: 'Canon', 
    series: 'imageRUNNER', 
    model: '1643i',
    status: 'maintenance',
    ownedBy: 'client',
    assignedTo: 'TechSolutions Inc',
    department: 'IT',
    location: 'Floor 3, Room 302',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const getStatusColor = (status: PrinterStatus) => {
  switch (status) {
    case 'available': return 'bg-status-available text-white';
    case 'rented': return 'bg-status-rented text-black';
    case 'maintenance': return 'bg-status-maintenance text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatusEmoji = (status: PrinterStatus) => {
  switch (status) {
    case 'available': return '🟢';
    case 'rented': return '🟡';
    case 'maintenance': return '🔴';
    default: return '⚪';
  }
};

export default function Printers() {
  const navigate = useNavigate();
  
  return (
    <MobileLayout
      fab={
        <div className="flex flex-col space-y-4">
          <Fab 
            icon={<ScanLine size={24} />} 
            aria-label="Scan barcode" 
            variant="secondary"
            size="sm"
          />
          <Fab aria-label="Add printer" />
        </div>
      }
    >
      <div className="container px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Printer Fleet</h1>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7h18" />
              <path d="M6 12h12" />
              <path d="M9 17h6" />
            </svg>
          </Button>
        </div>
        
        <div className="space-y-4">
          {mockPrinters.map((printer) => (
            <Card key={printer.id} className="overflow-hidden">
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{printer.make} {printer.model}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {printer.department} • {printer.location}
                  </p>
                </div>
                <Badge className={`ml-2 ${getStatusColor(printer.status)}`}>
                  {getStatusEmoji(printer.status)} {printer.status}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex justify-between mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 mr-2"
                    onClick={() => navigate(`/printers/${printer.id}`)}
                  >
                    Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">Assign</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
