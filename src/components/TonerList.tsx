
import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Toner {
  id: string;
  brand: string;
  model: string;
  color: string;
  page_yield: number;
}

export function TonerList() {
  const { toast } = useToast();
  const [toners, setToners] = useState<Toner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addTonerDialogOpen, setAddTonerDialogOpen] = useState(false);

  useEffect(() => {
    fetchToners();
  }, []);

  const fetchToners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('toners')
        .select('*');

      if (error) throw error;

      setToners(data as Toner[]);
    } catch (error: any) {
      toast({
        title: "Error fetching toners",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToner = () => {
    setAddTonerDialogOpen(true);
  };

  const filteredToners = toners.filter(toner =>
    toner.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    toner.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search toners..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Button variant="outline" onClick={handleAddToner}>
          <Plus className="h-4 w-4 mr-1" /> Add Toner
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredToners.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No toners found</p>
          <Button className="mt-4" onClick={handleAddToner}>Add New Toner</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredToners.map((toner) => (
            <Card key={toner.id}>
              <CardHeader>
                <CardTitle className="text-lg">{toner.brand} {toner.model}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mt-1">
                  <Badge>{toner.color}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {toner.page_yield.toLocaleString()} pages
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={addTonerDialogOpen} onOpenChange={setAddTonerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Toner</DialogTitle>
          </DialogHeader>
          {/* TODO: Add toner form */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTonerDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
