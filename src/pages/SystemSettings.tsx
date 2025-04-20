
import React from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function SystemSettings() {
  const { settings, updateStoreInfo, isLoading } = useSettings();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!settings?.storeInfo) return;
      await updateStoreInfo(settings.storeInfo);
      toast({
        title: "Settings updated",
        description: "Your system settings have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="container px-4 py-4">
        <h1 className="text-2xl font-bold mb-6">System Settings</h1>
        
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <Input
                  value={settings?.store_name || ''}
                  onChange={(e) => {
                    if (settings?.storeInfo) {
                      updateStoreInfo({
                        ...settings.storeInfo,
                        storeName: e.target.value
                      });
                    }
                  }}
                />
              </div>
              {/* Add more fields here */}
            </CardContent>
          </Card>

          <Button type="submit">Save Changes</Button>
        </form>
      </div>
    </MobileLayout>
  );
}
