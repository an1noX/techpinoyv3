
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PrinterIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';

export default function Auth() {
  const { session } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-primary p-3 rounded-full mb-4">
            <PrinterIcon className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">PrintPal Mobile</h1>
          <p className="text-sm text-muted-foreground">Printer Fleet Management</p>
        </div>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login to your account</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
              </CardHeader>
              <LoginForm />
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Enter your information to create an account.</CardDescription>
              </CardHeader>
              <SignUpForm />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
