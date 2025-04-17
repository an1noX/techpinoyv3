import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Fab } from '@/components/ui/fab';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer, PrinterStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchPrinters();
  }, []);
  
  const fetchPrinters = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('printers')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      const transformedPrinters: Printer[] = (data || []).map(printer => ({
        id: printer.id,
        make: printer.make,
        series: printer.series,
        model: printer.model,
        status: printer.status as PrinterStatus,
        ownedBy: printer.owned_by,
        assignedTo: printer.assigned_to || undefined,
        department: printer.department || undefined,
        location: printer.location || undefined,
        createdAt: printer.created_at,
        updatedAt: printer.updated_at
      }));
      
      setPrinters(transformedPrinters);
    } catch (error: any) {
      toast({
        title: "Error fetching printers",
        description: error.message,
        variant: "destructive"
      });
      
      const mockPrinters: Printer[] = [
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
      
      setPrinters(mockPrinters);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredPrinters = printers.filter(printer => 
    printer.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    printer.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    printer.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    printer.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAssignPrinter = async (printerId: string) => {
    navigate(`/printers/${printerId}`);
  };
  
  return (
    <MobileLayout
      fab={
        <div className="flex flex-col space-y-4">
          <Fab 
            icon={<Plus size={24} />} 
            aria-label="Add printer" 
            onClick={() => navigate('/printers/new')}
          />
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
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setSearchTerm('')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7h18" />
              <path d="M6 12h12" />
              <path d="M9 17h6" />
            </svg>
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredPrinters.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No printers found</p>
            <Button className="mt-4" onClick={() => navigate('/printers/new')}>Add Printer</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPrinters.map((printer) => (
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleAssignPrinter(printer.id)}
                    >
                      Assign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
