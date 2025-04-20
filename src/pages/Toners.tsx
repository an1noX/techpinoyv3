
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Fab } from '@/components/ui/fab';
import { Plus, Search, Filter, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Json } from '@/integrations/supabase/types';

interface Toner {
  id: string;
  brand: string;
  model: string;
  color: string;
  page_yield: number;
  stock: number;
  threshold: number;
  compatible_printers?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export default function Toners() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [toners, setToners] = useState<Toner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddTonerDialog, setOpenAddTonerDialog] = useState(false);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    color: 'black',
    page_yield: 0,
    stock: 0,
    threshold: 5
  });
  
  useEffect(() => {
    fetchToners();
  }, []);
  
  const fetchToners = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('toners')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setToners(data as Toner[] || []);
    } catch (error: any) {
      toast({
        title: "Error fetching toners",
        description: error.message,
        variant: "destructive"
      });
      
      // Mock data for development
      const mockToners: Toner[] = [
        {
          id: '1',
          brand: 'HP',
          model: 'CF400X',
          color: 'black',
          page_yield: 2800,
          stock: 5,
          threshold: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          brand: 'Brother',
          model: 'TN-760',
          color: 'black',
          page_yield: 3000,
          stock: 3,
          threshold: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          brand: 'Canon',
          model: 'CRG-045',
          color: 'cyan',
          page_yield: 1300,
          stock: 1,
          threshold: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      
      setToners(mockToners);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredToners = toners.filter(toner => 
    toner.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    toner.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    toner.color.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddToner = () => {
    setOpenAddTonerDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === 'page_yield' || id === 'stock' || id === 'threshold' ? parseInt(value) : value
    }));
  };

  const handleColorChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      color: value
    }));
  };

  const handleSaveToner = async () => {
    try {
      if (!formData.brand || !formData.model) {
        toast({
          title: "Validation Error",
          description: "Brand and model are required",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('toners')
        .insert([formData])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Toner added successfully"
      });

      setOpenAddTonerDialog(false);
      fetchToners();
      
      // Reset form
      setFormData({
        brand: '',
        model: '',
        color: 'black',
        page_yield: 0,
        stock: 0,
        threshold: 5
      });
    } catch (error: any) {
      toast({
        title: "Error adding toner",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock <= 0) return { label: 'Out of Stock', class: 'bg-red-500 text-white' };
    if (stock <= threshold) return { label: 'Low Stock', class: 'bg-yellow-500 text-black' };
    return { label: 'In Stock', class: 'bg-green-500 text-white' };
  };
  
  return (
    <MobileLayout
      fab={
        <Fab 
          icon={<Plus size={24} />} 
          aria-label="Add toner" 
          onClick={handleAddToner}
        />
      }
    >
      <div className="container px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">OEM Toners</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Manage toner inventory, stock levels, and compatible printers.
        </p>
        
        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search toners..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setSearchTerm('')}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredToners.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No toners found</p>
            <Button className="mt-4" onClick={handleAddToner}>Add Toner</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredToners.map((toner) => {
              const stockStatus = getStockStatus(toner.stock, toner.threshold);
              return (
                <Card key={toner.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{toner.brand} {toner.model}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Color: <span className="capitalize">{toner.color}</span> • Page Yield: {toner.page_yield.toLocaleString()}
                      </p>
                    </div>
                    <Badge className={`ml-2 ${stockStatus.class}`}>
                      {stockStatus.label}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Stock:</span> {toner.stock} units
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Alert at:</span> {toner.threshold} units
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Coming Soon",
                          description: "Toner details page under development"
                        });
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Coming Soon",
                          description: "Compatibility management under development"
                        });
                      }}
                    >
                      Manage Compatibility
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Toner Dialog */}
      <Dialog open={openAddTonerDialog} onOpenChange={setOpenAddTonerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Toner</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand*</label>
              <Input 
                id="brand" 
                placeholder="HP, Canon, Brother, etc." 
                value={formData.brand}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Model*</label>
              <Input 
                id="model" 
                placeholder="CF400X, TN-760, etc."
                value={formData.model}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <Select value={formData.color} onValueChange={handleColorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="cyan">Cyan</SelectItem>
                  <SelectItem value="magenta">Magenta</SelectItem>
                  <SelectItem value="yellow">Yellow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Page Yield</label>
              <Input 
                id="page_yield" 
                type="number"
                placeholder="3000"
                value={formData.page_yield.toString()}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Stock</label>
              <Input 
                id="stock" 
                type="number"
                placeholder="5"
                value={formData.stock.toString()}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Alert Threshold</label>
              <Input 
                id="threshold" 
                type="number"
                placeholder="2"
                value={formData.threshold.toString()}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAddTonerDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveToner}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
