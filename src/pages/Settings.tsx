import React from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { SettingsProvider } from "@/context/SettingsContext";
import { CompanyDetailsTab } from "@/components/settings/CompanyDetailsTab";
import { VideoAds1Tab } from "@/components/settings/VideoAds1Tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function Settings() {
  return (
    <MobileLayout>
      <SettingsProvider>
        <div className="container mx-auto py-6 px-4 pb-20">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          
          <Card className="p-6">
            <Tabs defaultValue="company" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="company">Company Details</TabsTrigger>
                <TabsTrigger value="videoAds1">Video Ads</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>
              
              <TabsContent value="company">
                <CompanyDetailsTab />
              </TabsContent>
              
              <TabsContent value="videoAds1">
                <VideoAds1Tab />
              </TabsContent>
              
              <TabsContent value="appearance">
                <div className="py-4">Appearance settings will be available soon.</div>
              </TabsContent>
              
              <TabsContent value="notifications">
                <div className="py-4">Notification settings will be available soon.</div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </SettingsProvider>
    </MobileLayout>
  );
}
