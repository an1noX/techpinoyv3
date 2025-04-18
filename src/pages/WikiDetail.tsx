
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, ArrowLeft, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WikiPrinter {
  id: string;
  make: string;
  series: string;
  model: string;
  maintenance_tips?: string;
  specs?: any;
  created_at: string;
  updated_at: string;
}

export default function WikiDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [printer, setPrinter] = useState<WikiPrinter | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('specs');
  
  useEffect(() => {
    if (id) {
      fetchPrinterDetails(id);
    }
  }, [id]);
  
  const fetchPrinterDetails = async (printerId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('printer_wiki')
        .select('*')
        .eq('id', printerId)
        .single();
      
      if (error) {
        throw error;
      }
      
      setPrinter(data);
    } catch (error: any) {
      toast({
        title: "Error fetching printer details",
        description: error.message,
        variant: "destructive"
      });
      
      // If we can't fetch the printer, create mock data for development
      const mockPrinter: WikiPrinter = {
        id: '1',
        make: 'HP',
        series: 'LaserJet',
        model: 'Pro MFP M428fdn',
        maintenance_tips: 'Regular maintenance includes cleaning the print heads every 3 months and replacing the drum after 30,000 pages.',
        specs: {
          resolution: '1200 x 1200 dpi',
          paperSize: 'A4, A5, Letter',
          connectivity: 'USB, Ethernet, Wi-Fi',
          printSpeed: '38 ppm',
          dimensions: '420 x 390 x 323 mm',
          weight: '12.9 kg'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setPrinter(mockPrinter);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditPrinter = () => {
    navigate(`/wiki/edit/${id}`);
  };
  
  const handleDeletePrinter = async () => {
    if (!printer) return;
    
    try {
      const { error } = await supabase
        .from('printer_wiki')
        .delete()
        .eq('id', printer.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Printer deleted",
        description: "The printer has been successfully removed from the wiki."
      });
      
      navigate('/wiki');
    } catch (error: any) {
      toast({
        title: "Error deleting printer",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  return (
    <MobileLayout>
      <div className="container px-4 py-4">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/wiki')}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold flex-1">
            {loading ? 'Loading...' : `${printer?.make} ${printer?.model}`}
          </h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleEditPrinter}
            className="mr-2"
          >
            <Pencil size={20} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDeletePrinter}
          >
            <Trash2 size={20} />
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : printer ? (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Printer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Make:</span>
                    <span className="font-medium">{printer.make}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Series:</span>
                    <span className="font-medium">{printer.series}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model:</span>
                    <span className="font-medium">{printer.model}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs 
              defaultValue="specs" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="specs">Specifications</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="specs" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Technical Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {printer.specs ? (
                      <div className="space-y-2">
                        {Object.entries(printer.specs).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground capitalize">{key}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No specifications available for this printer.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="maintenance" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Maintenance Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {printer.maintenance_tips ? (
                      <div className="prose max-w-none">
                        <p>{printer.maintenance_tips}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No maintenance tips available for this printer.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Compatible Toners</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-4">
                  Toner compatibility feature coming soon.
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Printer not found</p>
            <Button className="mt-4" onClick={() => navigate('/wiki')}>Back to Wiki</Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
