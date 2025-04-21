import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModelSelector } from "@/components/ui/model-selector";

// Add mock data for testing
const MOCK_PRINTERS = [
  { make: "HP", model: "LaserJet Pro M428fdn" },
  { make: "Brother", model: "MFC-L8900CDW" },
  { make: "Canon", model: "imageRUNNER 1643i" },
];

const maintenanceFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(),
  associated_with: z.string().optional(),
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

interface WikiMaintenanceGuideFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Add printer type
interface PrinterModel {
  id: string;
  make: string;
  model: string;
}

export function WikiMaintenanceGuideForm({ open, onOpenChange, onSuccess }: WikiMaintenanceGuideFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [printers, setPrinters] = useState<PrinterModel[]>([]);
  
  useEffect(() => {
    fetchPrinters();
  }, []);

  const fetchPrinters = async () => {
    const { data } = await supabase
      .from('wiki_printers')
      .select('id, make, model');
    setPrinters(data || []);
  };

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "maintenance",
      tags: [],
      associated_with: "",
    },
  });

  const onSubmit = async (data: MaintenanceFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create the article object with all required fields
      const articleData = {
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        associated_with: data.associated_with || null,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        submitted_by: null // Add this as it's part of the schema
      };

      const { error } = await supabase
        .from('wiki_articles')
        .insert(articleData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance guide added successfully",
        className: "bg-green-500",
        duration: 3000,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Maintenance Guide</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Monthly Maintenance for HP LaserJet Pro Series" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailed maintenance procedures and steps..." 
                      className="min-h-[300px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="associated_with"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associated Printer Model (Optional)</FormLabel>
                  <FormControl>
                    <ModelSelector 
                      value={field.value} 
                      onChange={(value) => field.onChange(value)}
                      models={printers?.map(p => `${p.make} ${p.model}`) || []}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto transition-all duration-200 ease-in-out"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⭮</span>
                    Saving...
                  </>
                ) : (
                  'Add Guide'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}