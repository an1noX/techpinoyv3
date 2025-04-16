
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Fab } from '@/components/ui/fab';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WikiPrinter {
  id: string;
  make: string;
  series: string;
  model: string;
}

export default function Wiki() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [printers, setPrinters] = useState<WikiPrinter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchPrinters();
  }, []);
  
  const fetchPrinters = async () => {
    try {
      setLoading(true);
      
      // Query wiki printers from Supabase
      const { data, error } = await supabase
        .from('printer_wiki')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setPrinters(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching printer wiki",
        description: error.message,
        variant: "destructive"
      });
      
      // Fallback to mock data if database isn't set up yet
      setPrinters([
        { id: '1', make: 'HP', series: 'LaserJet', model: 'Pro MFP M428fdn' },
        { id: '2', make: 'Brother', series: 'MFC', model: 'L8900CDW' },
        { id: '3', make: 'Canon', series: 'imageRUNNER', model: '1643i' },
        { id: '4', make: 'Xerox', series: 'VersaLink', model: 'C505' },
        { id: '5', make: 'Epson', series: 'WorkForce', model: 'Pro WF-C579R' },
      ]);
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
    printer.series.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleViewPrinterDetails = (printerId: string) => {
    // Navigate to printer wiki details page
    navigate(`/wiki/${printerId}`);
  };
  
  return (
    <MobileLayout
      fab={
        <Fab 
          icon={<Plus size={24} />} 
          aria-label="Add printer to wiki" 
          onClick={() => navigate('/wiki/new')}
        />
      }
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
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setSearchTerm('')}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredPrinters.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No printers found</p>
            <Button className="mt-4" onClick={() => navigate('/wiki/new')}>Add Printer to Wiki</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPrinters.map((printer) => (
              <Card key={printer.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">{printer.make} {printer.model}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">Series: {printer.series}</p>
                  <div className="flex justify-between mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewPrinterDetails(printer.id)}
                    >
                      Details
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
