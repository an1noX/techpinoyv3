
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MobileLayout } from '@/components/layout/MobileLayout';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define the form schema with Zod
const formSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  series: z.string().min(1, 'Series is required'),
  model: z.string().min(1, 'Model is required'),
  maintenance_tips: z.string().optional(),
  specs: z.record(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Specs fields to manage individually (will be combined into specs object)
interface SpecField {
  key: string;
  value: string;
}

export default function WikiCreateEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const { toast } = useToast();
  const [loading, setLoading] = useState(isEditing);
  const [specFields, setSpecFields] = useState<SpecField[]>([
    { key: 'resolution', value: '' },
    { key: 'paperSize', value: '' },
    { key: 'connectivity', value: '' },
    { key: 'printSpeed', value: '' },
  ]);
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      make: '',
      series: '',
      model: '',
      maintenance_tips: '',
    },
  });
  
  // Fetch printer data if in edit mode
  useEffect(() => {
    if (isEditing && id) {
      fetchPrinterData(id);
    }
  }, [isEditing, id]);
  
  const fetchPrinterData = async (printerId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('printer_wiki')
        .select('*')
        .eq('id', printerId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Set form values from fetched data
      form.reset({
        make: data.make,
        series: data.series,
        model: data.model,
        maintenance_tips: data.maintenance_tips || '',
      });
      
      // Set spec fields if exists
      if (data.specs) {
        const newSpecFields = Object.entries(data.specs).map(([key, value]) => ({
          key,
          value: value as string,
        }));
        setSpecFields(newSpecFields);
      }
      
    } catch (error: any) {
      toast({
        title: "Error fetching printer data",
        description: error.message,
        variant: "destructive"
      });
      navigate('/wiki');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddSpecField = () => {
    setSpecFields([...specFields, { key: '', value: '' }]);
  };
  
  const handleRemoveSpecField = (index: number) => {
    const updatedFields = [...specFields];
    updatedFields.splice(index, 1);
    setSpecFields(updatedFields);
  };
  
  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const updatedFields = [...specFields];
    updatedFields[index][field] = value;
    setSpecFields(updatedFields);
  };
  
  const onSubmit = async (formData: FormValues) => {
    try {
      setLoading(true);
      
      // Convert spec fields to an object
      const specsObject: Record<string, string> = {};
      specFields.forEach(field => {
        if (field.key && field.value) {
          specsObject[field.key] = field.value;
        }
      });
      
      // Make sure make, model, and series are included
      const printerData = {
        make: formData.make,
        series: formData.series,
        model: formData.model,
        maintenance_tips: formData.maintenance_tips,
        specs: Object.keys(specsObject).length > 0 ? specsObject : null,
      };
      
      let result;
      
      if (isEditing) {
        // Update existing printer
        result = await supabase
          .from('printer_wiki')
          .update(printerData)
          .eq('id', id);
      } else {
        // Insert new printer
        result = await supabase
          .from('printer_wiki')
          .insert(printerData);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: isEditing ? "Printer updated" : "Printer created",
        description: isEditing 
          ? "The printer details have been updated successfully."
          : "The printer has been added to the wiki."
      });
      
      navigate('/wiki');
      
    } catch (error: any) {
      toast({
        title: "Error saving printer",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <MobileLayout>
      <div className="container px-4 py-4">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/wiki')}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold flex-1">
            {isEditing ? 'Edit Printer' : 'Add Printer'}
          </h1>
          <Button 
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={form.handleSubmit(onSubmit)}
          >
            <Save size={18} className="mr-2" />
            Save
          </Button>
        </div>
        
        {loading && isEditing ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Input placeholder="HP, Canon, Epson..." {...field} />
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
                          <Input placeholder="LaserJet, PIXMA, WorkForce..." {...field} />
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
                          <Input placeholder="Pro MFP M428fdn, TS8320..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Technical Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {specFields.map((field, index) => (
                    <div key={index} className="flex gap-2">
                      <Input 
                        placeholder="Property name"
                        className="flex-1"
                        value={field.key}
                        onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                      />
                      <Input 
                        placeholder="Value"
                        className="flex-1"
                        value={field.value}
                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                      />
                      <Button 
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveSpecField(index)}
                      >
                        −
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddSpecField}
                    className="w-full"
                  >
                    + Add Specification
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="maintenance_tips"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maintenance Tips</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe regular maintenance procedures..."
                            className="min-h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{isEditing ? 'Update Printer' : 'Create Printer'}</>
                )}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </MobileLayout>
  );
}
