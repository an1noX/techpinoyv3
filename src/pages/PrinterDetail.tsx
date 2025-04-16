
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Edit, Share2, AlertTriangle, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, PrinterStatus } from '@/types';

// Mock printers for demonstration
const mockPrinters: Record<string, Printer & { department: string, location: string }> = {
  '1': { 
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
  '2': { 
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
  '3': { 
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
};

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

export default function PrinterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // In a real app, this would come from an API or state
  const printer = id ? mockPrinters[id] : null;
  
  if (!printer) {
    return (
      <MobileLayout>
        <div className="container px-4 py-4 text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-status-maintenance mb-4" />
          <h1 className="text-2xl font-bold">Printer Not Found</h1>
          <p className="text-muted-foreground mb-6">The requested printer could not be found.</p>
          <Button onClick={() => navigate('/printers')}>
            Back to Printers
          </Button>
        </div>
      </MobileLayout>
    );
  }
  
  return (
    <MobileLayout>
      <div className="container px-4 py-4">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 flex items-center"
          onClick={() => navigate('/printers')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{printer.make} {printer.model}</h1>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Edit className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <Badge className={`mb-4 ${getStatusColor(printer.status)}`}>
          {getStatusEmoji(printer.status)} {printer.status}
        </Badge>
        
        <Tabs defaultValue="details" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="toners">Toners</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Printer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center">
                    <Info className="h-5 w-5 mr-2 text-muted-foreground" />
                    <h3 className="font-medium">General Information</h3>
                  </div>
                  <Separator className="my-2" />
                  <div className="pl-7 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Make</span>
                      <span className="text-sm font-medium">{printer.make}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Series</span>
                      <span className="text-sm font-medium">{printer.series}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Model</span>
                      <span className="text-sm font-medium">{printer.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Owner</span>
                      <span className="text-sm font-medium capitalize">{printer.ownedBy}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-muted-foreground">
                      <path d="M20 10V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
                      <path d="M20 14v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" />
                      <path d="M12 12H4v4a4 4 0 0 0 4 4h12" />
                      <path d="M2 12h20" />
                    </svg>
                    <h3 className="font-medium">Location</h3>
                  </div>
                  <Separator className="my-2" />
                  <div className="pl-7 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Department</span>
                      <span className="text-sm font-medium">{printer.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Location</span>
                      <span className="text-sm font-medium">{printer.location}</span>
                    </div>
                    {printer.assignedTo && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Assigned To</span>
                        <span className="text-sm font-medium">{printer.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button className="flex-1">Change Status</Button>
                  {printer.status === 'available' && (
                    <Button variant="outline" className="flex-1">Rent Out</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="toners" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Compatible Toners</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Compatible toner cartridges for this printer model.
                </p>
                
                <div className="space-y-4">
                  {['Black', 'Cyan', 'Magenta', 'Yellow'].map((color) => (
                    <div key={color} className="border rounded-md p-3">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{color}</span>
                        <Badge variant="outline">In Stock: 12</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {printer.make} {color.charAt(0)}{color === 'Black' ? 'K' : color.charAt(1)}-120 Toner
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Page Yield: 2,000 pages
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Service History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-border ml-4"></div>
                  <div className="space-y-6 pl-10 relative">
                    {[
                      { date: '2023-04-01', action: 'Regular Maintenance', note: 'Cleaned printheads and replaced paper tray' },
                      { date: '2023-02-15', action: 'Toner Replacement', note: 'Replaced Cyan toner cartridge' },
                      { date: '2023-01-10', action: 'Initial Setup', note: 'Printer installed and configured' },
                    ].map((event, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-10 mt-1.5 w-4 h-4 rounded-full bg-primary"></div>
                        <h4 className="font-medium mb-1">{event.action}</h4>
                        <p className="text-sm text-muted-foreground mb-1">{new Date(event.date).toLocaleDateString()}</p>
                        <p className="text-sm">{event.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
