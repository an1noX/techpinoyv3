
import React from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SettingsIcon, BellIcon, LogOutIcon, UserIcon, KeyIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Profile() {
  return (
    <MobileLayout>
      <div className="container px-4 py-4">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="text-xl bg-primary text-primary-foreground">JD</AvatarFallback>
          </Avatar>
          
          <h1 className="text-2xl font-bold">John Doe</h1>
          <p className="text-muted-foreground">john.doe@example.com</p>
          <Badge className="mt-2">Admin</Badge>
        </div>
        
        <Tabs defaultValue="account" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                    <h3 className="font-medium">Personal Info</h3>
                  </div>
                  <Separator className="my-2" />
                  <div className="pl-7 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Name</span>
                      <span className="text-sm">John Doe</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span className="text-sm">john.doe@example.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Department</span>
                      <span className="text-sm">IT Operations</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <KeyIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                    <h3 className="font-medium">Account Security</h3>
                  </div>
                  <Separator className="my-2" />
                  <div className="pl-7">
                    <Button variant="outline" size="sm" className="w-full">Change Password</Button>
                  </div>
                </div>
                
                <Button variant="destructive" size="sm" className="w-full">
                  <LogOutIcon className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>App Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center">
                    <BellIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                    <h3 className="font-medium">Notifications</h3>
                  </div>
                  <Separator className="my-2" />
                  <div className="pl-7 space-y-2">
                    <Button variant="outline" size="sm" className="w-full">Manage Notifications</Button>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <SettingsIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                    <h3 className="font-medium">Preferences</h3>
                  </div>
                  <Separator className="my-2" />
                  <div className="pl-7 space-y-2">
                    <Button variant="outline" size="sm" className="w-full">App Preferences</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="text-center text-xs text-muted-foreground mt-8">
          <p>Printer Fleet Management v1.0.0</p>
          <p>© 2023 PrintPal Mobile</p>
        </div>
      </div>
    </MobileLayout>
  );
}
