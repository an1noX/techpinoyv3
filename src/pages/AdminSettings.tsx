
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { UserRoleManager } from '@/components/admin/UserRoleManager';
import { TechnicianAssignmentManager } from '@/components/admin/TechnicianAssignmentManager';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Settings, Users, Wrench } from 'lucide-react';
import { WikiApprovalSettings } from '@/components/admin/WikiApprovalSettings';

export default function AdminSettings() {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState("roles");
  
  // Redirect non-admin users
  if (!hasRole('admin')) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Settings className="h-6 w-6" />
        Admin Settings
      </h1>
      
      <Card className="p-6">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="roles" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              User Roles
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-1">
              <Wrench className="h-4 w-4" />
              Technician Assignments
            </TabsTrigger>
            <TabsTrigger value="wiki" className="flex items-center gap-1">
              <Wrench className="h-4 w-4" />
              Wiki Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="roles">
            <UserRoleManager />
          </TabsContent>
          
          <TabsContent value="assignments">
            <TechnicianAssignmentManager />
          </TabsContent>
          
          <TabsContent value="wiki">
            <WikiApprovalSettings />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
