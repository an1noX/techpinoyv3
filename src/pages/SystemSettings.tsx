import React, { useState, useEffect } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const generalSettingsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().optional(),
});

interface SystemSettingsType {
  id?: string;
  store_name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  tagline?: string;
  office_hours?: string;
  live_chat?: any;
  social_media?: any;
  created_at?: string;
  updated_at?: string;
}

export default function SystemSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettingsType | null>(null);
  const [loading, setLoading] = useState(true);

  const generalForm = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      companyName: '',
      email: '',
      phone: '',
      address: '',
      logoUrl: '',
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data as SystemSettingsType);
        generalForm.reset({
          companyName: data.store_name || '',
          email: data.email || '',
          phone: data.phone_number || '',
          address: data.address || '',
          logoUrl: '',
        });
      }
    } catch (error: any) {
      toast({
        title: "Error fetching settings",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralSubmit = async (values: z.infer<typeof generalSettingsSchema>) => {
    try {
      const updatedSettings = {
        store_name: values.companyName,
        email: values.email || null,
        phone_number: values.phone || null,
        address: values.address || null,
      };

      let operation;
      if (settings?.id) {
        operation = supabase
          .from('system_settings')
          .update(updatedSettings)
          .eq('id', settings.id);
      } else {
        operation = supabase
          .from('system_settings')
          .insert([updatedSettings]);
      }

      const { error } = await operation;
      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Your general settings have been saved successfully.",
      });
      fetchSettings();
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="container px-4 py-4">
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="container px-4 py-4">
        <h1 className="text-2xl font-bold mb-6">System Settings</h1>

        <Tabs defaultValue="general" className="mb-6">
          <TabsList className="w-full">
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4">
            <Form {...generalForm}>
              <form onSubmit={generalForm.handleSubmit(handleGeneralSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>Configure your business details that appear in reports and customer communications.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={generalForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Used for notifications and customer communications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Button type="submit">Save General Settings</Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
