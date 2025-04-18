
import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PrinterModelSelectProps {
  onSelect: (make: string, series: string, model: string) => void;
}

interface Make {
  id: string;
  name: string;
}

interface Series {
  id: string;
  name: string;
  make_id: string;
}

interface Model {
  id: string;
  name: string;
  series_id: string;
}

export const PrinterModelSelect = ({ onSelect }: PrinterModelSelectProps) => {
  const { toast } = useToast();
  const [makes, setMakes] = useState<Make[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  
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
    const { data, error } = await supabase
      .from('printer_makes')
      .select('*')
      .order('name');
    
    if (error) {
      toast({
        title: "Error fetching makes",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    setMakes(data);
  };

  const fetchSeries = async (makeId: string) => {
    const { data, error } = await supabase
      .from('printer_series')
      .select('*')
      .eq('make_id', makeId)
      .order('name');
    
    if (error) {
      toast({
        title: "Error fetching series",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    setSeries(data);
  };

  const fetchModels = async (seriesId: string) => {
    const { data, error } = await supabase
      .from('printer_models')
      .select('*')
      .eq('series_id', seriesId)
      .order('name');
    
    if (error) {
      toast({
        title: "Error fetching models",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    setModels(data);
  };

  const handleAddMake = async () => {
    if (!newMake.trim()) return;
    
    const { data, error } = await supabase
      .from('printer_makes')
      .insert({ name: newMake.trim() })
      .select()
      .single();
    
    if (error) {
      toast({
        title: "Error adding make",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    setMakes([...makes, data]);
    setSelectedMake(data.id);
    setNewMake('');
    setAddingMake(false);
  };

  const handleAddSeries = async () => {
    if (!newSeries.trim() || !selectedMake) return;
    
    const { data, error } = await supabase
      .from('printer_series')
      .insert({ name: newSeries.trim(), make_id: selectedMake })
      .select()
      .single();
    
    if (error) {
      toast({
        title: "Error adding series",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    setSeries([...series, data]);
    setSelectedSeries(data.id);
    setNewSeries('');
    setAddingSeries(false);
  };

  const handleAddModel = async () => {
    if (!newModel.trim() || !selectedSeries) return;
    
    const { data, error } = await supabase
      .from('printer_models')
      .insert({ name: newModel.trim(), series_id: selectedSeries })
      .select()
      .single();
    
    if (error) {
      toast({
        title: "Error adding model",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    setModels([...models, data]);
    setSelectedModel(data.id);
    setNewModel('');
    setAddingModel(false);
  };

  useEffect(() => {
    if (selectedMake && selectedSeries && selectedModel) {
      const make = makes.find(m => m.id === selectedMake)?.name || '';
      const serie = series.find(s => s.id === selectedSeries)?.name || '';
      const model = models.find(m => m.id === selectedModel)?.name || '';
      onSelect(make, serie, model);
    }
  }, [selectedMake, selectedSeries, selectedModel]);

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
