import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, X, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EditableToner, TonerBase } from '@/types/types';
import { Json } from '@/integrations/supabase/types';

export function TonerList() {
  const { toast } = useToast();
  const [toners, setToners] = useState<EditableToner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addTonerDialogOpen, setAddTonerDialogOpen] = useState(false);
  const [editingToner, setEditingToner] = useState<EditableToner | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tonerToDelete, setTonerToDelete] = useState<EditableToner | null>(null);
  const [formData, setFormData] = useState<TonerBase & {id?: string}>({
    brand: '',
    model: '',
    color: 'black',
    oem_code: '',
    page_yield: 0,
    aliases: [],
    is_base_model: false,
    base_model_reference: null,
    variant_name: null,
  });

  useEffect(() => {
    fetchToners();
  }, []);

  const fetchToners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('toners')
        .select('*')
        .order('brand')
        .order('model')
        .order('variant_name');

      if (error) throw error;

      const processedData = (data || []).map(toner => {
        const aliases = Array.isArray(toner.aliases) 
          ? toner.aliases.map((alias: any) => String(alias))
          : [];
          
        const compatible_printers = toner.compatible_printers 
          ? (Array.isArray(toner.compatible_printers) 
              ? toner.compatible_printers.map((printer: any) => String(printer))
              : null)
          : null;
          
        const variant_details = typeof toner.variant_details === 'object' 
          ? toner.variant_details 
          : null;
        
        const name = `${toner.brand} ${toner.model}${toner.variant_name ? ` ${toner.variant_name}` : ''}`;
        
        return {
          ...toner,
          name,
          aliases,
          compatible_printers,
          variant_details
        } as EditableToner;
      });

      setToners(processedData);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (editingToner) {
      setEditingToner({
        ...editingToner,
        [id]: id === 'page_yield' ? parseInt(value) : value
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: id === 'page_yield' ? parseInt(value) : value
      }));
    }
  };

  const handleColorChange = (value: string) => {
    if (editingToner) {
      setEditingToner({
        ...editingToner,
        color: value
      });
    } else {
      setFormData(prev => ({
        ...prev,
        color: value
      }));
    }
  };

  const handleAddToner = async () => {
    try {
      if (!formData.brand || !formData.model) {
        toast({
          title: "Validation Error",
          description: "Brand and model are required",
          variant: "destructive"
        });
        return;
      }

      const newToner = {
        ...formData,
        aliases: formData.aliases?.filter(alias => typeof alias === 'string' && alias.trim() !== '') || [],
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('toners')
        .insert([newToner]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "OEM Toner reference added successfully"
      });

      setAddTonerDialogOpen(false);
      fetchToners();
      
      setFormData({
        brand: '',
        model: '',
        color: 'black',
        oem_code: '',
        page_yield: 0,
        aliases: []
      });
    } catch (error: any) {
      toast({
        title: "Error adding toner",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditClick = (toner: EditableToner) => {
    setEditingToner({
      ...toner,
      is_base_model: toner.is_base_model || false,
      base_model_reference: toner.base_model_reference || null,
      variant_name: toner.variant_name || null,
      isEditing: true
    });
  };

  const handleCancelEdit = () => {
    setEditingToner(null);
  };

  const handleSaveEdit = async () => {
    if (!editingToner) return;

    try {
      const { error } = await supabase
        .from('toners')
        .update({
          brand: editingToner.brand,
          model: editingToner.model,
          color: editingToner.color,
          oem_code: editingToner.oem_code,
          page_yield: editingToner.page_yield,
          aliases: editingToner.aliases,
          is_base_model: editingToner.is_base_model,
          base_model_reference: editingToner.base_model_reference,
          variant_name: editingToner.variant_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingToner.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "OEM Toner reference updated successfully"
      });

      setEditingToner(null);
      fetchToners();
    } catch (error: any) {
      toast({
        title: "Error updating toner",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddAlias = () => {
    if (editingToner) {
      setEditingToner({
        ...editingToner,
        aliases: [...(editingToner.aliases || []), '']
      });
    } else {
      setFormData(prev => ({
        ...prev,
        aliases: [...(prev.aliases || []), '']
      }));
    }
  };

  const handleRemoveAlias = (index: number) => {
    if (editingToner) {
      const updatedAliases = [...(editingToner.aliases || [])];
      updatedAliases.splice(index, 1);
      setEditingToner({
        ...editingToner,
        aliases: updatedAliases
      });
    } else {
      const updatedAliases = [...(formData.aliases || [])];
      updatedAliases.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        aliases: updatedAliases
      }));
    }
  };

  const handleAliasChange = (index: number, value: string) => {
    if (editingToner) {
      const updatedAliases = [...(editingToner.aliases || [])];
      updatedAliases[index] = value;
      setEditingToner({
        ...editingToner,
        aliases: updatedAliases
      });
    } else {
      const updatedAliases = [...(formData.aliases || [])];
      updatedAliases[index] = value;
      setFormData(prev => ({
        ...prev,
        aliases: updatedAliases
      }));
    }
  };

  const handleDeleteClick = (toner: EditableToner) => {
    setTonerToDelete(toner);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tonerToDelete) return;

    try {
      const { error } = await supabase
        .from('toners')
        .delete()
        .eq('id', tonerToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "OEM Toner reference deleted successfully"
      });

      setDeleteDialogOpen(false);
      setTonerToDelete(null);
      fetchToners();
    } catch (error: any) {
      toast({
        title: "Error deleting toner",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredToners = toners.filter(toner =>
    toner.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    toner.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    toner.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (toner.oem_code && toner.oem_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (toner.aliases && toner.aliases.some(alias => 
      typeof alias === 'string' && alias.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search OEM toner references..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => setSearchTerm('')}>
          <Filter className="h-4 w-4" />
        </Button>
        <Button onClick={() => setAddTonerDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add OEM Reference
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size={32} />
        </div>
      ) : filteredToners.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No OEM toners found</p>
          <Button className="mt-4" onClick={() => setAddTonerDialogOpen(true)}>Add OEM Reference</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredToners.map((toner) => (
            <Card key={toner.id} className={`overflow-hidden transition-colors ${editingToner?.id === toner.id ? 'border-primary' : ''}`}>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  {editingToner?.id === toner.id ? (
                    <div className="space-y-4 w-full">
                      <div className="grid gap-4">
                        <div>
                          <Label>Brand</Label>
                          <Input 
                            id="brand"
                            value={editingToner.brand}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <Label>Model</Label>
                          <Input 
                            id="model"
                            value={editingToner.model}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <Label>OEM Code</Label>
                          <Input 
                            id="oem_code"
                            value={editingToner.oem_code || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <Label>Color</Label>
                          <Select value={editingToner.color} onValueChange={handleColorChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="black">Black</SelectItem>
                              <SelectItem value="cyan">Cyan</SelectItem>
                              <SelectItem value="magenta">Magenta</SelectItem>
                              <SelectItem value="yellow">Yellow</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Page Yield</Label>
                          <Input 
                            id="page_yield"
                            type="number"
                            value={editingToner.page_yield}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox 
                            id="is_base_model"
                            checked={editingToner.is_base_model}
                            onCheckedChange={(checked) => 
                              setEditingToner(prev => prev ? ({ ...prev, is_base_model: checked as boolean }) : null)
                            }
                          />
                          <Label htmlFor="is_base_model">This is a base model</Label>
                        </div>

                        {!editingToner.is_base_model && (
                          <div className="space-y-4">
                            <div>
                              <Label>Base Model Reference</Label>
                              <Select 
                                value={editingToner.base_model_reference || ''} 
                                onValueChange={(value) => setEditingToner(prev => prev ? ({
                                  ...prev,
                                  base_model_reference: value || null
                                }) : null)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select base model" />
                                </SelectTrigger>
                                <SelectContent>
                                  {toners
                                    .filter(t => t.is_base_model)
                                    .map(toner => (
                                      <SelectItem key={toner.id} value={toner.id}>
                                        {toner.brand} {toner.model}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Variant Name</Label>
                              <Input 
                                id="variant_name"
                                placeholder="e.g. High Yield"
                                value={editingToner.variant_name || ''}
                                onChange={(e) => setEditingToner(prev => prev ? ({
                                  ...prev,
                                  variant_name: e.target.value
                                }) : null)}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Aliases (Alternative Names)</Label>
                        {(editingToner.aliases || []).map((alias, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={alias}
                              onChange={(e) => handleAliasChange(index, e.target.value)}
                              placeholder="Alternative name/code"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemoveAlias(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddAlias}
                          className="w-full"
                        >
                          + Add Alias
                        </Button>
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleSaveEdit}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <CardTitle className="text-lg">{toner.brand} {toner.model}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="capitalize">{toner.color}</Badge>
                          {toner.oem_code && <Badge variant="outline">{toner.oem_code}</Badge>}
                          <span className="text-sm text-muted-foreground">
                            {toner.page_yield.toLocaleString()} pages
                          </span>
                        </div>
                        {toner.aliases && toner.aliases.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Also known as: {toner.aliases.join(', ')}
                          </p>
                        )}
                        {toner.variant_name && (
                          <p className="text-sm mt-1">
                            <span className="text-muted-foreground">Variant: </span>
                            {toner.variant_name}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(toner)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteClick(toner)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {toner.is_base_model && (
                  <Badge variant="secondary" className="mt-2">Base Model</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={addTonerDialogOpen} onOpenChange={setAddTonerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add OEM Toner Reference</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Brand*</Label>
              <Input 
                id="brand" 
                placeholder="HP, Canon, Brother, etc." 
                value={formData.brand}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <Label>Model*</Label>
              <Input 
                id="model" 
                placeholder="CF400X, TN-760, etc."
                value={formData.model}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label>OEM Code</Label>
              <Input 
                id="oem_code" 
                placeholder="Manufacturer's code"
                value={formData.oem_code || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <Label>Color</Label>
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
            
            <div>
              <Label>Page Yield</Label>
              <Input 
                id="page_yield" 
                type="number"
                placeholder="3000"
                value={formData.page_yield.toString()}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox 
                  id="is_base_model"
                  checked={formData.is_base_model}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_base_model: checked as boolean }))
                  }
                />
                <Label htmlFor="is_base_model">This is a base model</Label>
              </div>

              {!formData.is_base_model && (
                <div className="space-y-4">
                  <div>
                    <Label>Base Model Reference</Label>
                    <Select 
                      value={formData.base_model_reference || ''} 
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        base_model_reference: value || null
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select base model" />
                      </SelectTrigger>
                      <SelectContent>
                        {toners
                          .filter(t => t.is_base_model)
                          .map(toner => (
                            <SelectItem key={toner.id} value={toner.id}>
                              {toner.brand} {toner.model}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Variant Name</Label>
                    <Input 
                      id="variant_name"
                      placeholder="e.g. High Yield"
                      value={formData.variant_name || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Aliases (Alternative Names)</Label>
              {(formData.aliases || []).map((alias, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={alias}
                    onChange={(e) => handleAliasChange(index, e.target.value)}
                    placeholder="Alternative name/code"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveAlias(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddAlias}
                className="w-full"
              >
                + Add Alias
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTonerDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddToner}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete OEM Toner Reference</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this toner reference? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {tonerToDelete && (
            <div className="py-4">
              <p className="font-medium">{tonerToDelete.brand} {tonerToDelete.model}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {tonerToDelete.color} • {tonerToDelete.page_yield.toLocaleString()} pages
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
