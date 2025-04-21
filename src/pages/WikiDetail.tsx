import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, ArrowLeft, Trash2, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WikiPrinter {
  id: string;
  make: string;
  series: string;
  model: string;
  maintenance_tips?: string;
  specs?: any;
  description?: string;
  oem_toner?: string | null;
  type?: string;
  created_at: string;
  updated_at: string;
}

interface Toner {
  id: string;
  model: string;
  brand: string;
  color: string;
  oem_code?: string;
}

export default function WikiDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [printer, setPrinter] = useState<WikiPrinter | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('specs');
  const [oemToner, setOemToner] = useState<Toner | null>(null);
  const [compatibleToners, setCompatibleToners] = useState<Toner[]>([]);

  useEffect(() => {
    if (id) fetchPrinterDetails(id);
  }, [id]);

  useEffect(() => {
    if (printer && printer.oem_toner) {
      fetchOemTonerAndCompatibles(printer.oem_toner);
    } else {
      setOemToner(null);
      setCompatibleToners([]);
    }
  }, [printer]);

  const fetchPrinterDetails = async (printerId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('printer_wiki')
        .select('*')
        .eq('id', printerId)
        .maybeSingle();
      if (error) throw error;
      setPrinter(data);
    } catch (error: any) {
      toast({
        title: "Error fetching printer details",
        description: error.message,
        variant: "destructive"
      });
      setPrinter(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchOemTonerAndCompatibles = async (oemTonerId: string) => {
    setOemToner(null);
    setCompatibleToners([]);
    const { data: toner, error: tonerError } = await supabase
      .from('toners')
      .select('id, model, brand, oem_code, color')
      .eq('id', oemTonerId)
      .maybeSingle();
    if (!toner || tonerError) return;

    setOemToner(toner as Toner);

    const { data: compatibles, error: compatiblesErr } = await supabase
      .from('toners')
      .select('id, model, brand, oem_code, color')
      .eq('base_model_reference', oemTonerId);

    if (!compatibles || compatiblesErr) {
      setCompatibleToners([]);
      return;
    }
    setCompatibleToners(compatibles as Toner[]);
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
      if (error) throw error;
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
            {loading ? 'Loading...' : `${printer?.make || ""} ${printer?.model || ""}`}
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{printer.type || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Description:</span>
                    <span className="font-medium">{printer.description || "—"}</span>
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="specs">Specifications</TabsTrigger>
                <TabsTrigger value="toners">OEM Toner</TabsTrigger>
                <TabsTrigger value="compatibles">Compatible Toners</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-4">
                <Card>
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
              </TabsContent>
              
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
              
              <TabsContent value="toners" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>OEM Toner</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {oemToner ? (
                      <div>
                        <Tag className="inline mb-1 text-blue-500" />
                        <span className="ml-1 font-semibold">{oemToner.brand} {oemToner.model}</span>
                        <span className="ml-3 text-xs text-muted-foreground">(OEM Code: {oemToner.oem_code || "N/A"})</span>
                        <span className="ml-3 text-xs text-muted-foreground">Color: {oemToner.color}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No OEM Toner assigned.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compatibles" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Compatible Toners</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {compatibleToners.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {compatibleToners.map(t => (
                          <span
                            key={t.id}
                            className="inline-block text-xs px-3 py-1 bg-blue-100 text-blue-900 rounded"
                            title={`OEM: ${t.oem_code || ""} (${t.model})`}
                          >
                            {t.brand} {t.model} {t.color && <>({t.color})</>}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No compatible toners found.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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
