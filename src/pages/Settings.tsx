
import React from "react";
import { SettingsProvider } from "@/context/SettingsContext";
import { CompanyDetailsTab } from "@/components/settings/CompanyDetailsTab";
import { VideoAds1Tab } from "@/components/settings/VideoAds1Tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        
        <Card className="p-6">
          <Tabs defaultValue="company" className="w-full">
            <TabsList className="mb-4 grid grid-cols-2 md:grid-cols-4">
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
    </MobileLayout>
  );
}
