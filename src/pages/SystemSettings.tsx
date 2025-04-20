
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
import { MaintenanceSettings } from '@/types/settings';
import { Switch } from '@/components/ui/switch';

const generalSettingsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().optional(),
});

const maintenanceSettingsSchema = z.object({
  enableScheduledMaintenance: z.boolean(),
  defaultMaintenancePeriod: z.number().min(1, 'Must be at least 1').default(90),
  notifyBeforeDays: z.number().min(1, 'Must be at least 1').default(7),
  defaultTechnicians: z.string().optional(),
  autoGenerateReports: z.boolean(),
  maintenanceInstructions: z.string().optional(),
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
  maintenance_settings?: MaintenanceSettings;
  created_at?: string;
  updated_at?: string;
}

export default function SystemSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

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

  const maintenanceForm = useForm<z.infer<typeof maintenanceSettingsSchema>>({
    resolver: zodResolver(maintenanceSettingsSchema),
    defaultValues: {
      enableScheduledMaintenance: false,
      defaultMaintenancePeriod: 90,
      notifyBeforeDays: 7,
      defaultTechnicians: '',
      autoGenerateReports: false,
      maintenanceInstructions: '',
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

        // Initialize maintenance form if maintenance settings exist
        if (data.maintenance_settings) {
          maintenanceForm.reset({
            enableScheduledMaintenance: data.maintenance_settings.enableScheduledMaintenance || false,
            defaultMaintenancePeriod: data.maintenance_settings.defaultMaintenancePeriod || 90,
            notifyBeforeDays: data.maintenance_settings.notifyBeforeDays || 7,
            defaultTechnicians: data.maintenance_settings.defaultTechnicians || '',
            autoGenerateReports: data.maintenance_settings.autoGenerateReports || false,
            maintenanceInstructions: data.maintenance_settings.maintenanceInstructions || '',
          });
        }
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

  const handleMaintenanceSubmit = async (values: z.infer<typeof maintenanceSettingsSchema>) => {
    try {
      if (!settings?.id) {
        toast({
          title: "Error saving settings",
          description: "Please save general settings first.",
          variant: "destructive"
        });
        return;
      }

      const updatedSettings = {
        maintenance_settings: values
      };

      const { error } = await supabase
        .from('system_settings')
        .update(updatedSettings)
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "Maintenance settings updated",
        description: "Your maintenance settings have been saved successfully.",
      });
      fetchSettings();
    } catch (error: any) {
      toast({
        title: "Error saving maintenance settings",
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
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

          <TabsContent value="maintenance" className="mt-4">
            <Form {...maintenanceForm}>
              <form onSubmit={maintenanceForm.handleSubmit(handleMaintenanceSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Maintenance Settings</CardTitle>
                    <CardDescription>Configure default settings for printer maintenance and repairs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={maintenanceForm.control}
                      name="enableScheduledMaintenance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Enable Scheduled Maintenance
                            </FormLabel>
                            <FormDescription>
                              Automatically schedule maintenance for printers
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={maintenanceForm.control}
                      name="defaultMaintenancePeriod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Maintenance Period (days)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value) || 90)}
                            />
                          </FormControl>
                          <FormDescription>
                            How often printers should be scheduled for maintenance
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={maintenanceForm.control}
                      name="notifyBeforeDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notification Lead Time (days)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 7)}
                            />
                          </FormControl>
                          <FormDescription>
                            How many days before scheduled maintenance to send notifications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={maintenanceForm.control}
                      name="defaultTechnicians"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Technicians</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter technician names, one per line" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Default list of technicians for maintenance assignments
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={maintenanceForm.control}
                      name="autoGenerateReports"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Auto-Generate Reports
                            </FormLabel>
                            <FormDescription>
                              Automatically generate maintenance reports after completion
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={maintenanceForm.control}
                      name="maintenanceInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Maintenance Instructions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter default instructions for maintenance procedures" 
                              className="min-h-[150px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            These instructions will be included in maintenance tasks
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Button type="submit">Save Maintenance Settings</Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
