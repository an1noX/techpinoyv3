
import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PrinterSeriesRPC } from '@/types';
import { rpcGetPrinterSeries, rpcCreatePrinterSeries } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface PrinterSeriesSelectProps {
  makeId: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PrinterSeriesSelect({ makeId, value, onChange, disabled = false }: PrinterSeriesSelectProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState<PrinterSeriesRPC[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState('');
  const [addingSeries, setAddingSeries] = useState(false);

  useEffect(() => {
    if (makeId) {
      fetchSeries();
    } else {
      setSeries([]);
      onChange('');
    }
  }, [makeId]);

  const fetchSeries = async () => {
    if (!makeId) return;
    
    try {
      setLoading(true);
      const { data, error } = await rpcGetPrinterSeries(makeId);
      
      if (error) throw error;
      
      if (data) {
        setSeries(data);
        
        // If no value is selected but we have series, select the first one
        if (!value && data.length > 0) {
          onChange(data[0].id);
        } else if (value && !data.some(s => s.id === value)) {
          // If the selected value is not in the new list, reset it
          onChange('');
        }
      }
    } catch (error: any) {
      toast({
        title: "Error fetching printer series",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSeries = async () => {
    if (!newSeriesName.trim() || !makeId) return;
    
    try {
      setAddingSeries(true);
      
      const { data, error } = await rpcCreatePrinterSeries(makeId, newSeriesName.trim());
      
      if (error) throw error;
      
      if (data) {
        // Add the new series to the list
        setSeries(prev => [...prev, data]);
        
        // Select the newly created series
        onChange(data.id);
        
        toast({
          title: "Success",
          description: `Series "${newSeriesName}" added successfully`,
        });
        
        // Reset and close dialog
        setNewSeriesName('');
        setAddDialogOpen(false);
      }
    } catch (error: any) {
      toast({
        title: "Error adding printer series",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setAddingSeries(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Printer Series</Label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setAddDialogOpen(true)}
          className="h-6 px-2"
          disabled={!makeId || disabled}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Add</span>
        </Button>
      </div>
      
      <Select 
        value={value} 
        onValueChange={onChange} 
        disabled={loading || !makeId || disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a printer series" />
        </SelectTrigger>
        <SelectContent>
          {series.map(item => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Printer Series</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="series-name">Series Name</Label>
              <Input 
                id="series-name"
                placeholder="e.g., LaserJet, PIXMA, EcoTank..." 
                value={newSeriesName}
                onChange={(e) => setNewSeriesName(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddSeries} 
              disabled={!newSeriesName.trim() || addingSeries}
            >
              {addingSeries ? 'Adding...' : 'Add Series'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
