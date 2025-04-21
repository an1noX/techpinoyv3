import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { WikiPrinter, ArticleStatus } from "@/types/types";

const printerFormSchema = z.object({
  make: z.string().min(1, "Make is required"),
  series: z.string().min(1, "Series is required"),
  model: z.string().min(1, "Model is required"),
  type: z.string().min(1, "Type is required"),
  description: z.string().optional(),
  maintenance_tips: z.string().optional(),
  specs: z.object({
    resolution: z.string().optional(),
    paperSize: z.string().optional(),
    connectivity: z.string().optional(),
    printSpeed: z.string().optional(),
    duplex: z.string().optional(),
    monthlyDuty: z.string().optional(),
  }).optional(),
});

type PrinterFormValues = z.infer<typeof printerFormSchema>;

interface WikiPrinterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function WikiPrinterForm({ open, onOpenChange, onSuccess }: WikiPrinterFormProps) {
  const { toast } = useToast();
  
  const form = useForm<PrinterFormValues>({
    resolver: zodResolver(printerFormSchema),
    defaultValues: {
      make: "",
      series: "",
      model: "",
      type: "laser",
      description: "",
      maintenance_tips: "",
      specs: {
        resolution: "",
        paperSize: "",
        connectivity: "",
        printSpeed: "",
        duplex: "",
        monthlyDuty: "",
      },
    },
  });

  const onSubmit = async (data: PrinterFormValues) => {
    try {
      const printerData = {
        make: data.make,
        series: data.series,
        model: data.model,
        type: data.type,
        description: data.description || null,
        maintenance_tips: data.maintenance_tips || null,
        // Convert specs to JSONB compatible format
        specs: data.specs ? JSON.stringify(data.specs) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'published' as ArticleStatus
      };

      const { error } = await supabase
        .from('wiki_printers')
        .insert([printerData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Printer model added successfully",
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Printer Model</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., HP, Canon, Brother" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="series"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Series</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., LaserJet, imageRUNNER" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Pro MFP M428fdn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="laser">Laser</SelectItem>
                        <SelectItem value="inkjet">Inkjet</SelectItem>
                        <SelectItem value="dot-matrix">Dot Matrix</SelectItem>
                        <SelectItem value="thermal">Thermal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the printer model" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maintenance_tips"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance Tips</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Common maintenance procedures and tips" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Technical Specifications</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="specs.resolution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resolution</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 1200 x 1200 dpi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specs.paperSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paper Size</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., A4, Letter, Legal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specs.connectivity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Connectivity</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., USB, Ethernet, Wi-Fi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specs.printSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Print Speed</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 40 ppm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specs.duplex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duplex Printing</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Automatic, Manual" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specs.monthlyDuty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Duty Cycle</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 80,000 pages" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Add Printer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}