import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Fab } from '@/components/ui/fab';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TonerList } from '@/components/TonerList';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WikiPrinter } from '@/types';
import { ViewButton } from '@/components/common/ActionButtons';

export default function Wiki() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [printers, setPrinters] = useState<WikiPrinter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('printers');
  
  useEffect(() => {
    fetchPrinters();
  }, []);
  
  const fetchPrinters = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('printer_wiki')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setPrinters(data as WikiPrinter[]);
    } catch (error: any) {
      toast({
        title: "Error fetching printer wiki",
        description: error.message,
        variant: "destructive"
      });
      
      // Mock data for development
      const mockPrinters: WikiPrinter[] = [
        { 
          id: '1', 
          make: 'HP', 
          series: 'LaserJet', 
          model: 'Pro MFP M428fdn',
          maintenance_tips: 'Clean monthly with compressed air. Replace toner when indicated.',
          specs: { resolution: '1200x1200 dpi', speed: '40 ppm', connectivity: 'USB, Ethernet, Wi-Fi' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { 
          id: '2', 
          make: 'Brother', 
          series: 'MFC', 
          model: 'L8900CDW',
          maintenance_tips: 'Check drum units every 3 months. Clean paper path when jams occur.',
          specs: { resolution: '2400x600 dpi', speed: '33 ppm', connectivity: 'USB, Ethernet, Wi-Fi, NFC' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { 
          id: '3', 
          make: 'Canon', 
          series: 'imageRUNNER', 
          model: '1643i',
          maintenance_tips: 'Replace toner according to manufacturer guidelines. Clean scanner glass daily.',
          specs: { resolution: '600x600 dpi', speed: '45 ppm', connectivity: 'USB, Ethernet' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      
      setPrinters(mockPrinters);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddPrinter = () => {
    navigate('/wiki/new');
  };
  
  return (
    <MobileLayout
      fab={
        activeTab === 'printers' ? (
          <Fab 
            icon={<Plus size={24} />} 
            aria-label="Add printer to wiki" 
            onClick={handleAddPrinter}
          />
        ) : null
      }
    >
      <div className="container px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Printer Wiki</h1>
          <div className="text-sm bg-blue-100 text-blue-800 rounded-md px-2 py-1">
            Master List
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Manage printer models and compatible toners in the Wiki database.
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="printers">Printers</TabsTrigger>
            <TabsTrigger value="toners">OEM Toners</TabsTrigger>
          </TabsList>
          
          <TabsContent value="printers" className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search printers..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => setSearchTerm('')}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : printers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No printers found</p>
                <Button className="mt-4" onClick={handleAddPrinter}>Add Printer to Wiki</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {printers
                  .filter(printer => 
                    printer.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    printer.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    printer.series.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((printer) => (
                    <Card key={printer.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg">{printer.make} {printer.model}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground">Series: {printer.series}</p>
                        <div className="flex justify-between mt-2">
                          <ViewButton onClick={() => navigate(`/wiki/${printer.id}`)} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="toners">
            <TonerList />
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
