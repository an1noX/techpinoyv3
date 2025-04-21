import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, ArrowLeft, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { TonerCompatibilityManager } from '@/components/TonerCompatibilityManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

interface WikiPrinter {
  id: string;
  make: string;
  series: string;
  model: string;
  maintenance_tips?: string;
  specs?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export default function WikiDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [printer, setPrinter] = useState<WikiPrinter | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('specs');
  const [detailsModal, setDetailsModal] = useState(false);
  const [specsModal, setSpecsModal] = useState(false);
  const [tonersModal, setTonersModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Permission checks
  const canEdit = hasPermission('update:wiki');
  const canDelete = hasPermission('delete:wiki');
  
  useEffect(() => {
    if (id) {
      fetchPrinterDetails(id);
    }
  }, [id]);
  
  const fetchPrinterDetails = async (printerId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('wiki_printers')
        .select('*')
        .eq('id', printerId)
        .single();
      
      if (error) throw error;
      
      // Parse specs if it's a string
      const parsedData: WikiPrinter = {
        ...data,
        specs: typeof data.specs === 'string' 
          ? JSON.parse(data.specs)
          : data.specs
      };
      
      setPrinter(parsedData);
    } catch (error: any) {
      toast({
        title: "Error fetching printer details",
        description: error.message,
        variant: "destructive"
      });
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
        .from('wiki_printers')
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
  
  if (loading) {
    return (
      <MobileLayout>
        <div className="container px-4 py-8">
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!printer) {
    return (
      <MobileLayout>
        <div className="container px-4 py-8">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Printer not found</h3>
                <p className="text-muted-foreground mb-4">This printer may have been removed from the wiki.</p>
                <Button onClick={() => navigate('/wiki')}>Back to Wiki</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    );
  }
  
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
            {`${printer.make} ${printer.model}`}
          </h1>
          {canEdit && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleEditPrinter}
              className="mr-2"
            >
              <Pencil size={20} />
            </Button>
          )}
          {canDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <Trash2 size={20} />
            </Button>
          )}
        </div>
        
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
        
        <div className="flex gap-2 mb-6">
          <Button variant="outline" onClick={() => setDetailsModal(true)}>
            Details
          </Button>
          <Button variant="outline" onClick={() => setSpecsModal(true)}>
            Specification
          </Button>
          <Button variant="outline" onClick={() => setTonersModal(true)}>
            Toners
          </Button>
        </div>

        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Are you sure you want to delete this printer from the wiki? This action cannot be undone.
            </DialogDescription>
            <DialogFooter className="flex gap-2">
              <Button variant="destructive" onClick={handleDeletePrinter}>Delete</Button>
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Tabs 
          defaultValue="specs" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="toners">Toners</TabsTrigger>
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
                  {printer.maintenance_tips && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Maintenance Tips:</h3>
                      <p className="text-muted-foreground text-sm">{printer.maintenance_tips}</p>
                    </div>
                  )}
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
            {printer ? (
              <TonerCompatibilityManager printerId={printer.id} />
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
