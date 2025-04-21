import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CommercialTonerProduct, OEMToner } from '@/types';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Json } from '@/integrations/supabase/types';

const formSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  stock_level: z.number().min(0, 'Stock level must be greater than or equal to 0'),
  reorder_point: z.number().min(0, 'Reorder point must be greater than or equal to 0'),
  category: z.array(z.string()),
  toner_id: z.string().min(1, 'OEM Toner reference is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface TonerProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: CommercialTonerProduct;
  onSave?: (product: CommercialTonerProduct) => void;
}

export function TonerProductDialog({ 
  open, 
  onOpenChange, 
  product,
  onSave 
}: TonerProductDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [oemToners, setOEMToners] = useState<OEMToner[]>([]);
  const isEditing = !!product;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: product?.sku || '',
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      stock_level: product?.stock_level || 0,
      reorder_point: product?.reorder_point || 5,
      category: product?.category || [],
      toner_id: product?.toner_id || ''
    }
  });

  useEffect(() => {
    fetchOEMToners();
  }, []);

  const fetchOEMToners = async () => {
    try {
      const { data, error } = await supabase
        .from('wiki_toners')
        .select('*')
        .order('brand', { ascending: true });

      if (error) throw error;
      
      const processedData = (data || []).map(toner => {
        return {
          id: toner.id,
          brand: toner.brand,
          model: toner.model,
          color: toner.color,
          oem_code: toner.oem_code || null,
          page_yield: toner.page_yield || 0,
          aliases: Array.isArray(toner.aliases) ? toner.aliases : [],
          compatible_printers: toner.compatible_printers || [],
          created_at: toner.created_at,
          updated_at: toner.updated_at
        } as OEMToner;
      });
      
      setOEMToners(processedData);
    } catch (error: any) {
      toast({
        title: "Error fetching OEM toners",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      
      const productData = {
        sku: values.sku,
        name: values.name,
        description: values.description,
        price: values.price,
        stock_level: values.stock_level,
        reorder_point: values.reorder_point,
        category: values.category,
        toner_id: values.toner_id,
        is_active: true
      };

      let result;
      
      if (isEditing && product) {
        result = await supabase
          .from('product_toners')
          .update(productData)
          .eq('id', product.id)
          .select('*')
          .single();
      } else {
        result = await supabase
          .from('product_toners')
          .insert(productData)
          .select('*')
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: isEditing ? "Product updated" : "Product created",
        description: isEditing 
          ? "The product has been updated successfully."
          : "The product has been created successfully."
      });

      if (onSave && result.data) {
        onSave(result.data);
      }
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error saving product",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter product SKU" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter product name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Enter product description"
                      className="h-20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                        min={0}
                        step={0.01}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Level</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reorder_point"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reorder Point</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                      min={0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toner_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OEM Toner Reference</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select OEM toner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {oemToners.map(toner => (
                        <SelectItem key={toner.id} value={toner.id}>
                          {toner.brand} {toner.model} ({toner.color})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner size={16} className="mr-2" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Update' : 'Create'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
