
import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PrinterMake, PrinterSeries, PrinterModel } from '@/types';

interface PrinterModelSelectProps {
  onSelect: (make: string, series: string, model: string) => void;
}

// Define RPC function response types to help TypeScript understand the return values
interface PrinterMakeRPC {
  id: string;
  name: string;
  created_at: string;
}

interface PrinterSeriesRPC {
  id: string;
  make_id: string;
  name: string;
  created_at: string;
}

interface PrinterModelRPC {
  id: string;
  series_id: string;
  name: string;
  created_at: string;
}

export const PrinterModelSelect = ({ onSelect }: PrinterModelSelectProps) => {
  const { toast } = useToast();
  const [makes, setMakes] = useState<PrinterMake[]>([]);
  const [series, setSeries] = useState<PrinterSeries[]>([]);
  const [models, setModels] = useState<PrinterModel[]>([]);
  
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedSeries, setSelectedSeries] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  
  const [newMake, setNewMake] = useState('');
  const [newSeries, setNewSeries] = useState('');
  const [newModel, setNewModel] = useState('');
  
  const [addingMake, setAddingMake] = useState(false);
  const [addingSeries, setAddingSeries] = useState(false);
  const [addingModel, setAddingModel] = useState(false);

  useEffect(() => {
    fetchMakes();
  }, []);

  useEffect(() => {
    if (selectedMake) {
      fetchSeries(selectedMake);
      setSelectedSeries('');
      setSelectedModel('');
    }
  }, [selectedMake]);

  useEffect(() => {
    if (selectedSeries) {
      fetchModels(selectedSeries);
      setSelectedModel('');
    }
  }, [selectedSeries]);

  const fetchMakes = async () => {
    try {
      const { data, error } = await supabase.rpc<PrinterMakeRPC[], { id: string; name: string; created_at: string; }>('get_printer_makes');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const mappedMakes: PrinterMake[] = data.map((make) => ({
          id: make.id,
          name: make.name,
          createdAt: make.created_at
        }));
        
        setMakes(mappedMakes);
      }
    } catch (error: any) {
      console.error("Error fetching makes:", error);
      toast({
        title: "Error fetching makes",
        description: error.message,
        variant: "destructive"
      });
      
      // Fallback to empty array if there's an error
      setMakes([]);
    }
  };

  const fetchSeries = async (makeId: string) => {
    try {
      const { data, error } = await supabase.rpc<PrinterSeriesRPC[], { id: string; make_id: string; name: string; created_at: string; }>('get_printer_series', { 
        make_id_param: makeId 
      });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const mappedSeries: PrinterSeries[] = data.map((series) => ({
          id: series.id,
          makeId: series.make_id,
          name: series.name,
          createdAt: series.created_at
        }));
        
        setSeries(mappedSeries);
      }
    } catch (error: any) {
      console.error("Error fetching series:", error);
      toast({
        title: "Error fetching series",
        description: error.message,
        variant: "destructive"
      });
      
      // Fallback to empty array if there's an error
      setSeries([]);
    }
  };

  const fetchModels = async (seriesId: string) => {
    try {
      const { data, error } = await supabase.rpc<PrinterModelRPC[], { id: string; series_id: string; name: string; created_at: string; }>('get_printer_models', { 
        series_id_param: seriesId 
      });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const mappedModels: PrinterModel[] = data.map((model) => ({
          id: model.id,
          seriesId: model.series_id,
          name: model.name,
          createdAt: model.created_at
        }));
        
        setModels(mappedModels);
      }
    } catch (error: any) {
      console.error("Error fetching models:", error);
      toast({
        title: "Error fetching models",
        description: error.message,
        variant: "destructive"
      });
      
      // Fallback to empty array if there's an error
      setModels([]);
    }
  };

  const handleAddMake = async () => {
    if (!newMake.trim()) return;
    
    try {
      const { data, error } = await supabase.rpc<PrinterMakeRPC, { id: string; name: string; created_at: string; }>('insert_printer_make', { 
        make_name: newMake.trim() 
      });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const newMakeData: PrinterMake = {
          id: data.id,
          name: data.name,
          createdAt: data.created_at
        };
        
        setMakes([...makes, newMakeData]);
        setSelectedMake(newMakeData.id);
        setNewMake('');
        setAddingMake(false);
        
        toast({
          title: "Make added",
          description: `Added ${newMakeData.name} successfully`,
        });
      }
    } catch (error: any) {
      console.error("Error adding make:", error);
      toast({
        title: "Error adding make",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddSeries = async () => {
    if (!newSeries.trim() || !selectedMake) return;
    
    try {
      const { data, error } = await supabase.rpc<PrinterSeriesRPC, { id: string; make_id: string; name: string; created_at: string; }>('insert_printer_series', { 
        series_name: newSeries.trim(),
        make_id_param: selectedMake
      });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const newSeriesData: PrinterSeries = {
          id: data.id,
          makeId: data.make_id,
          name: data.name,
          createdAt: data.created_at
        };
        
        setSeries([...series, newSeriesData]);
        setSelectedSeries(newSeriesData.id);
        setNewSeries('');
        setAddingSeries(false);
        
        toast({
          title: "Series added",
          description: `Added ${newSeriesData.name} successfully`,
        });
      }
    } catch (error: any) {
      console.error("Error adding series:", error);
      toast({
        title: "Error adding series",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddModel = async () => {
    if (!newModel.trim() || !selectedSeries) return;
    
    try {
      const { data, error } = await supabase.rpc<PrinterModelRPC, { id: string; series_id: string; name: string; created_at: string; }>('insert_printer_model', { 
        model_name: newModel.trim(),
        series_id_param: selectedSeries
      });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const newModelData: PrinterModel = {
          id: data.id,
          seriesId: data.series_id,
          name: data.name,
          createdAt: data.created_at
        };
        
        setModels([...models, newModelData]);
        setSelectedModel(newModelData.id);
        setNewModel('');
        setAddingModel(false);
        
        toast({
          title: "Model added",
          description: `Added ${newModelData.name} successfully`,
        });
      }
    } catch (error: any) {
      console.error("Error adding model:", error);
      toast({
        title: "Error adding model",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (selectedMake && selectedSeries && selectedModel) {
      const make = makes.find(m => m.id === selectedMake)?.name || '';
      const serie = series.find(s => s.id === selectedSeries)?.name || '';
      const model = models.find(m => m.id === selectedModel)?.name || '';
      onSelect(make, serie, model);
    }
  }, [selectedMake, selectedSeries, selectedModel, makes, series, models, onSelect]);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Select value={selectedMake} onValueChange={setSelectedMake}>
            <SelectTrigger>
              <SelectValue placeholder="Select make" />
            </SelectTrigger>
            <SelectContent>
              {makes.map((make) => (
                <SelectItem key={make.id} value={make.id}>
                  {make.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setAddingMake(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {addingMake && (
          <div className="flex items-center gap-2 mt-2">
            <Input
              value={newMake}
              onChange={(e) => setNewMake(e.target.value)}
              placeholder="New make name"
            />
            <Button onClick={handleAddMake}>Add</Button>
            <Button variant="outline" onClick={() => setAddingMake(false)}>Cancel</Button>
          </div>
        )}
      </div>

      {selectedMake && (
        <div>
          <div className="flex items-center gap-2">
            <Select value={selectedSeries} onValueChange={setSelectedSeries}>
              <SelectTrigger>
                <SelectValue placeholder="Select series" />
              </SelectTrigger>
              <SelectContent>
                {series.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => setAddingSeries(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {addingSeries && (
            <div className="flex items-center gap-2 mt-2">
              <Input
                value={newSeries}
                onChange={(e) => setNewSeries(e.target.value)}
                placeholder="New series name"
              />
              <Button onClick={handleAddSeries}>Add</Button>
              <Button variant="outline" onClick={() => setAddingSeries(false)}>Cancel</Button>
            </div>
          )}
        </div>
      )}

      {selectedSeries && (
        <div>
          <div className="flex items-center gap-2">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => setAddingModel(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {addingModel && (
            <div className="flex items-center gap-2 mt-2">
              <Input
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                placeholder="New model name"
              />
              <Button onClick={handleAddModel}>Add</Button>
              <Button variant="outline" onClick={() => setAddingModel(false)}>Cancel</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
