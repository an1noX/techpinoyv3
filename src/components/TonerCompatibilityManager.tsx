
import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Toner {
  id: string;
  brand: string;
  model: string;
  color: string;
  page_yield: number;
}

interface TonerCompatibilityManagerProps {
  printerId: string;
}

export function TonerCompatibilityManager({ printerId }: TonerCompatibilityManagerProps) {
  const { toast } = useToast();
  const [compatibleToners, setCompatibleToners] = useState<Toner[]>([]);
  const [loading, setLoading] = useState(true);
  const [addTonerDialogOpen, setAddTonerDialogOpen] = useState(false);
  const [availableToners, setAvailableToners] = useState<Toner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompatibleToners();
  }, [printerId]);

  const fetchCompatibleToners = async () => {
    try {
      const { data, error } = await supabase
        .from('printer_toner_compatibility')
        .select(`
          toner_id,
          toners (
            id,
            brand,
            model,
            color,
            page_yield
          )
        `)
        .eq('printer_wiki_id', printerId);

      if (error) throw error;

      const toners = data.map(item => item.toners as Toner);
      setCompatibleToners(toners);
    } catch (error: any) {
      toast({
        title: "Error fetching compatible toners",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTonerClick = async () => {
    try {
      const { data, error } = await supabase
        .from('toners')
        .select('*')
        .not('id', 'in', `(${compatibleToners.map(t => t.id).join(',')})`);

      if (error) throw error;

      setAvailableToners(data);
      setAddTonerDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error fetching available toners",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddToner = async (toner: Toner) => {
    try {
      const { error } = await supabase
        .from('printer_toner_compatibility')
        .insert({
          printer_wiki_id: printerId,
          toner_id: toner.id
        });

      if (error) throw error;

      setCompatibleToners([...compatibleToners, toner]);
      setAddTonerDialogOpen(false);
      
      toast({
        title: "Toner added",
        description: "Toner compatibility has been updated"
      });
    } catch (error: any) {
      toast({
        title: "Error adding toner",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRemoveToner = async (tonerId: string) => {
    try {
      const { error } = await supabase
        .from('printer_toner_compatibility')
        .delete()
        .eq('printer_wiki_id', printerId)
        .eq('toner_id', tonerId);

      if (error) throw error;

      setCompatibleToners(compatibleToners.filter(t => t.id !== tonerId));
      
      toast({
        title: "Toner removed",
        description: "Toner compatibility has been updated"
      });
    } catch (error: any) {
      toast({
        title: "Error removing toner",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredToners = availableToners.filter(toner =>
    toner.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    toner.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Compatible Toners</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAddTonerClick}
          className="ml-2"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Toner
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : compatibleToners.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No compatible toners added yet
          </p>
        ) : (
          <div className="space-y-2">
            {compatibleToners.map((toner) => (
              <div
                key={toner.id}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div>
                  <p className="font-medium">{toner.brand} {toner.model}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge>{toner.color}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {toner.page_yield.toLocaleString()} pages
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveToner(toner.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={addTonerDialogOpen} onOpenChange={setAddTonerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Compatible Toner</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              placeholder="Search toners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredToners.map((toner) => (
                <div
                  key={toner.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div>
                    <p className="font-medium">{toner.brand} {toner.model}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge>{toner.color}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {toner.page_yield.toLocaleString()} pages
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddToner(toner)}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTonerDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
