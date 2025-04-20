
/**
 * TonerCompatibilityManager
 * 
 * This component manages the relationship between printers and their compatible OEM toner models.
 * It uses the reference data from the 'toners' table and maintains relationships in 'printer_toner_compatibility'.
 * 
 * Note: This is NOT related to product inventory management. This component only handles 
 * the reference data that indicates which toner models are compatible with which printers.
 * For actual product inventory management, see the TonerProducts page.
 */

import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface TonerType {
  id: string;
  brand: string;
  model: string;
  color: string;
  oem_code?: string | null;
  page_yield: number;
  aliases?: string[] | null;
}

interface TonerCompatibilityManagerProps {
  printerId: string;
}

export function TonerCompatibilityManager({ printerId }: TonerCompatibilityManagerProps) {
  const { toast } = useToast();
  const [compatibleToners, setCompatibleToners] = useState<TonerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [addTonerDialogOpen, setAddTonerDialogOpen] = useState(false);
  const [availableToners, setAvailableToners] = useState<TonerType[]>([]);
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
            oem_code,
            page_yield,
            aliases
          )
        `)
        .eq('printer_wiki_id', printerId);

      if (error) throw error;

      const toners = data
        .filter(item => item.toners !== null)
        .map(item => {
          const toner = item.toners as any;
          // Ensure aliases is always an array of strings
          const aliases = Array.isArray(toner.aliases) 
            ? toner.aliases.map((alias: any) => String(alias))
            : [];
          
          return {
            ...toner,
            aliases
          };
        });

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
        .select('*');

      if (error) throw error;

      // Filter out toners that are already in the compatible list
      const compatibleTonerIds = compatibleToners.map(t => t.id);
      const filteredData = data.filter(toner => !compatibleTonerIds.includes(toner.id));

      // Ensure all toner aliases are properly processed to be string arrays
      const processedData = filteredData.map(toner => {
        // Ensure aliases is always an array of strings
        const aliases = Array.isArray(toner.aliases) 
          ? toner.aliases.map((alias: any) => String(alias))
          : [];
        
        return {
          ...toner,
          aliases
        };
      });

      setAvailableToners(processedData);
      setAddTonerDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error fetching available toners",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddToner = async (toner: TonerType) => {
    try {
      const { error } = await supabase
        .from('printer_toner_compatibility')
        .insert({
          printer_wiki_id: printerId,
          toner_id: toner.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setCompatibleToners([...compatibleToners, toner]);
      setAddTonerDialogOpen(false);
      
      toast({
        title: "Success",
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
        title: "Success",
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
    toner.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (toner.oem_code && toner.oem_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (toner.aliases && toner.aliases.some(alias => 
      typeof alias === 'string' && alias.toLowerCase().includes(searchTerm.toLowerCase())
    ))
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
            <LoadingSpinner size={24} />
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
                    <Badge variant="outline" className="capitalize">{toner.color}</Badge>
                    {toner.oem_code && <Badge variant="outline">{toner.oem_code}</Badge>}
                    <span className="text-sm text-muted-foreground">
                      {toner.page_yield.toLocaleString()} pages
                    </span>
                  </div>
                  {toner.aliases && toner.aliases.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Also known as: {toner.aliases.join(', ')}
                    </p>
                  )}
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
                      <Badge variant="outline" className="capitalize">{toner.color}</Badge>
                      {toner.oem_code && <Badge variant="outline">{toner.oem_code}</Badge>}
                      <span className="text-sm text-muted-foreground">
                        {toner.page_yield.toLocaleString()} pages
                      </span>
                    </div>
                    {toner.aliases && toner.aliases.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Also known as: {toner.aliases.join(', ')}
                      </p>
                    )}
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
