
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
import { PrinterModelRPC } from '@/types';
import { rpcGetPrinterModels, rpcCreatePrinterModel } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { PrinterMakeSelect } from './PrinterMakeSelect';
import { PrinterSeriesSelect } from './PrinterSeriesSelect';

interface PrinterModelSelectProps {
  seriesId: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  showFullSelector?: boolean;
}

export function PrinterModelSelect({ 
  seriesId, 
  value, 
  onChange, 
  disabled = false,
  showFullSelector = false
}: PrinterModelSelectProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<PrinterModelRPC[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [addingModel, setAddingModel] = useState(false);
  
  // For full selector
  const [selectedMakeId, setSelectedMakeId] = useState('');
  const [selectedSeriesId, setSelectedSeriesId] = useState('');

  useEffect(() => {
    if (seriesId) {
      fetchModels();
      if (showFullSelector) {
        setSelectedSeriesId(seriesId);
      }
    } else {
      setModels([]);
      onChange('');
    }
  }, [seriesId]);

  const fetchModels = async () => {
    if (!seriesId) return;
    
    try {
      setLoading(true);
      const { data, error } = await rpcGetPrinterModels(seriesId);
      
      if (error) throw error;
      
      if (data) {
        setModels(data);
        
        // If no value is selected but we have models, select the first one
        if (!value && data.length > 0) {
          onChange(data[0].id);
        } else if (value && !data.some(m => m.id === value)) {
          // If the selected value is not in the new list, reset it
          onChange('');
        }
      }
    } catch (error: any) {
      toast({
        title: "Error fetching printer models",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddModel = async () => {
    // Use either the passed seriesId or the one from the full selector
    const effectiveSeriesId = showFullSelector ? selectedSeriesId : seriesId;
    
    if (!newModelName.trim() || !effectiveSeriesId) return;
    
    try {
      setAddingModel(true);
      
      const { data, error } = await rpcCreatePrinterModel(
        effectiveSeriesId, 
        newModelName.trim()
      );
      
      if (error) throw error;
      
      if (data) {
        // Add the new model to the list
        setModels(prev => [...prev, data]);
        
        // Select the newly created model
        onChange(data.id);
        
        // If in full selector mode and the new model's series matches the current filter
        if (showFullSelector && data.series_id === selectedSeriesId) {
          fetchModels();
        }
        
        toast({
          title: "Success",
          description: `Model "${newModelName}" added successfully`,
        });
        
        // Reset and close dialog
        setNewModelName('');
        setAddDialogOpen(false);
      }
    } catch (error: any) {
      toast({
        title: "Error adding printer model",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setAddingModel(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Printer Model</Label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setAddDialogOpen(true)}
          className="h-6 px-2"
          disabled={!seriesId || disabled}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Add</span>
        </Button>
      </div>
      
      <Select 
        value={value} 
        onValueChange={onChange} 
        disabled={loading || !seriesId || disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a printer model" />
        </SelectTrigger>
        <SelectContent>
          {models.map(model => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Printer Model</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {showFullSelector && (
              <>
                <PrinterMakeSelect
                  value={selectedMakeId}
                  onChange={setSelectedMakeId}
                />
                
                <PrinterSeriesSelect
                  makeId={selectedMakeId}
                  value={selectedSeriesId}
                  onChange={setSelectedSeriesId}
                  disabled={!selectedMakeId}
                />
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="model-name">Model Name</Label>
              <Input 
                id="model-name"
                placeholder="e.g., Pro MFP M428fdn, MX922..." 
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddModel} 
              disabled={
                !newModelName.trim() || 
                addingModel || 
                (showFullSelector ? !selectedSeriesId : !seriesId)
              }
            >
              {addingModel ? 'Adding...' : 'Add Model'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
