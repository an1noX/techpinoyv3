
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
import { PrinterMakeRPC } from '@/types';
import { rpcGetPrinterMakes, rpcCreatePrinterMake } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface PrinterMakeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function PrinterMakeSelect({ value, onChange }: PrinterMakeSelectProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [makes, setMakes] = useState<PrinterMakeRPC[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newMakeName, setNewMakeName] = useState('');
  const [addingMake, setAddingMake] = useState(false);

  useEffect(() => {
    fetchMakes();
  }, []);

  const fetchMakes = async () => {
    try {
      setLoading(true);
      const { data, error } = await rpcGetPrinterMakes();
      
      if (error) throw error;
      
      if (data) {
        setMakes(data);
        
        // If no value is selected but we have makes, select the first one
        if (!value && data.length > 0) {
          onChange(data[0].id);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error fetching printer makes",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMake = async () => {
    if (!newMakeName.trim()) return;
    
    try {
      setAddingMake(true);
      
      const { data, error } = await rpcCreatePrinterMake(newMakeName.trim());
      
      if (error) throw error;
      
      if (data) {
        // Add the new make to the list
        setMakes(prev => [...prev, data]);
        
        // Select the newly created make
        onChange(data.id);
        
        toast({
          title: "Success",
          description: `Make "${newMakeName}" added successfully`,
        });
        
        // Reset and close dialog
        setNewMakeName('');
        setAddDialogOpen(false);
      }
    } catch (error: any) {
      toast({
        title: "Error adding printer make",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setAddingMake(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Printer Make</Label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setAddDialogOpen(true)}
          className="h-6 px-2"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Add</span>
        </Button>
      </div>
      
      <Select value={value} onValueChange={onChange} disabled={loading}>
        <SelectTrigger>
          <SelectValue placeholder="Select a printer make" />
        </SelectTrigger>
        <SelectContent>
          {makes.map(make => (
            <SelectItem key={make.id} value={make.id}>
              {make.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Printer Make</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="make-name">Make Name</Label>
              <Input 
                id="make-name"
                placeholder="e.g., HP, Canon, Epson..." 
                value={newMakeName}
                onChange={(e) => setNewMakeName(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddMake} 
              disabled={!newMakeName.trim() || addingMake}
            >
              {addingMake ? 'Adding...' : 'Add Make'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
