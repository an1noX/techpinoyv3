import React, { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function SystemSettings() {
  const { toast } = useToast();
  const [storeName, setStoreName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate a successful save
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
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>
              {/* You can add more static fields here if needed */}
            </CardContent>
          </Card>

          <Button type="submit">Save Changes</Button>
        </form>
      </div>
    </MobileLayout>
  );
}
