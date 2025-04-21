import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { Toner, WikiToner } from '@/types/types';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const tonerFormSchema = z.object({
  brand: z.string().min(1, { message: 'Brand is required' }),
  model: z.string().min(1, { message: 'Model is required' }),
  color: z.string().min(1, { message: 'Color is required' }),
  page_yield: z.coerce.number().min(1, { message: 'Page yield must be a positive number' }),
  oem_code: z.string().optional(),
  aliases: z.string().optional(),
  compatibility: z.string().optional(),
  manufacturer: z.string().optional(),
  image_url: z.string().optional(),
  price: z.coerce.number().optional(),
  stock: z.coerce.number().optional(),
  threshold: z.coerce.number().optional(),
  is_active: z.boolean().default(true),
  description: z.string().optional(),
});

type TonerFormValues = z.infer<typeof tonerFormSchema>;

interface WikiAddTonerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function WikiAddTonerDialog({ open, onOpenChange, onSuccess }: WikiAddTonerDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TonerFormValues>({
    resolver: zodResolver(tonerFormSchema),
    defaultValues: {
      brand: '',
      model: '',
      color: '',
      page_yield: 0,
      oem_code: '',
      aliases: '',
      compatibility: '',
      manufacturer: '',
      image_url: '',
      price: 0,
      stock: 0,
      threshold: 0,
      is_active: true,
      description: '',
    },
  });

  const onSubmit = async (data: TonerFormValues) => {
    try {
      setIsSubmitting(true);

      const tonerData: WikiToner = {
        id: crypto.randomUUID(),
        brand: data.brand,
        model: data.model,
        color: data.color,
        page_yield: data.page_yield,
        oem_code: data.oem_code,
        aliases: data.aliases ? data.aliases.split(',').map((alias) => alias.trim()) : [],
        compatible_printers: data.compatibility ? data.compatibility.split(',').map((printer) => printer.trim()) : [],
        stock: data.stock || 0,
        threshold: data.threshold || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        image_url: data.image_url,
        is_active: data.is_active || true,
        is_commercial_product: false,
        variant_details: {},
        is_base_model: true,
        base_model_reference: '',
        variant_group_id: '',
        variant_name: '',
        description: data.description,
        sku: '',
        category: [],
        name: `${data.brand} ${data.model}`,
      };

      const { error } = await supabase.from('wiki_toners').insert(tonerData);

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Toner created successfully',
        className: 'bg-green-500',
        duration: 3000,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use the correct Toner type from src/types/types.ts
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Add New Toner</DialogTitle>
      </DialogHeader>
      <DialogContent className="max-h-[70vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input placeholder="Toner Brand" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input placeholder="Toner Model" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input placeholder="Toner Color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="page_yield"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Yield</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Page Yield" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="oem_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OEM Code</FormLabel>
                  <FormControl>
                    <Input placeholder="OEM Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aliases"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aliases (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="Aliases" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="compatibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compatible Printers (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="Compatible Printers" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacturer</FormLabel>
                  <FormControl>
                    <Input placeholder="Manufacturer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Image URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Price" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Stock" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Threshold</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Threshold" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Is Active</FormLabel>
                  </div>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
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
                    <Textarea placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
