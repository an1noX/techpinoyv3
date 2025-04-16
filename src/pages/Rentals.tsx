
import React from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Fab } from '@/components/ui/fab';
import { Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockRentals = [
  { 
    id: '1',
    client: 'Acme Corp',
    printer: 'HP LaserJet Pro MFP M428fdn',
    startDate: '2023-04-10',
    endDate: '2023-06-10',
    status: 'active',
  },
  { 
    id: '2',
    client: 'TechSolutions Inc',
    printer: 'Brother MFC-L8900CDW',
    startDate: '2023-03-15',
    endDate: '2023-05-15',
    status: 'active',
  },
  { 
    id: '3',
    client: 'Global Services LLC',
    printer: 'Canon imageRUNNER 1643i',
    startDate: '2023-02-01',
    endDate: '2023-04-01',
    status: 'completed',
  },
];

export default function Rentals() {
  return (
    <MobileLayout
      fab={<Fab aria-label="Create rental" />}
    >
      <div className="container px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Rentals</h1>
        </div>

        <Tabs defaultValue="active" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search rentals..."
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {mockRentals.filter(r => r.status === 'active').map((rental) => (
            <Card key={rental.id} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">{rental.client}</CardTitle>
                  <Badge className="bg-status-rented text-black">Active</Badge>
                </div>
                <CardDescription className="text-sm">{rental.printer}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-sm mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Start:</span>
                    <span className="font-medium">{new Date(rental.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End:</span>
                    <span className="font-medium">{new Date(rental.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <Button variant="outline" size="sm" className="flex-1 mr-2">Details</Button>
                  <Button variant="outline" size="sm" className="flex-1">Extend</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
