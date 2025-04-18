
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SettingsIcon, BellIcon, LogOutIcon, UserIcon, KeyIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  department: string | null;
  role: string;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    department: '',
    role: 'client'
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, department, role')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setProfileData(data);
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error.message);
        toast({
          title: 'Error fetching profile',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, toast]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      navigate('/auth');
    }
  };

  // Prepare display values
  const fullName = profileData.first_name && profileData.last_name 
    ? `${profileData.first_name} ${profileData.last_name}`
    : user?.email?.split('@')[0] || 'User';
    
  const initials = profileData.first_name && profileData.last_name
    ? `${profileData.first_name[0]}${profileData.last_name[0]}`.toUpperCase()
    : user?.email?.[0].toUpperCase() || 'U';
    
  const userEmail = user?.email || '';
  const userRole = profileData.role || 'client';
  const department = profileData.department || 'Not assigned';

  return (
    <MobileLayout>
      <div className="container px-4 py-4">
        {loading ? (
          <div className="flex justify-center items-center h-[80vh]">
            <p>Loading profile...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="text-xl bg-primary text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              
              <h1 className="text-2xl font-bold">{fullName}</h1>
              <p className="text-muted-foreground">{userEmail}</p>
              <Badge className="mt-2 capitalize">{userRole}</Badge>
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
                          <span className="text-sm">{fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Email</span>
                          <span className="text-sm">{userEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Department</span>
                          <span className="text-sm">{department}</span>
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
                    
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full"
                      onClick={handleSignOut}
                    >
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
          </>
        )}
      </div>
    </MobileLayout>
  );
}
