
import React, { useEffect, useState } from 'react';
import { AuthProvider } from './AuthProvider';
import { Toaster } from '@/components/ui/toaster';
import { useAppInitializer } from '@/services/appInit';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { initialize } = useAppInitializer();
  const [initializationComplete, setInitializationComplete] = useState(false);
  const [initializationSuccess, setInitializationSuccess] = useState(false);
  
  useEffect(() => {
    const initApp = async () => {
      const success = await initialize();
      setInitializationSuccess(success);
      setInitializationComplete(true);
    };
    
    initApp();
  }, [initialize]);
  
  // Display loading state while app initializes
  if (!initializationComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-lg font-medium">Initializing database connection...</p>
        <p className="text-sm text-muted-foreground mt-2">Please wait while we set up the application.</p>
      </div>
    );
  }
  
  // Display error state if initialization failed
  if (!initializationSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <div className="bg-destructive text-destructive-foreground p-3 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Database Connection Error</h1>
        <p className="mb-4">Failed to connect to the database. Please check your database configuration.</p>
        <div className="p-4 bg-card rounded-lg border max-w-md">
          <h2 className="font-semibold mb-2">Troubleshooting Steps:</h2>
          <ol className="list-decimal list-inside text-left space-y-2">
            <li>Ensure MariaDB is running on your server</li>
            <li>Check your database credentials in the environment variables</li>
            <li>Verify network connectivity to the database server</li>
            <li>Make sure the database schema exists</li>
            <li>Check for any firewall issues blocking the connection</li>
          </ol>
        </div>
        <button 
          className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  // App initialized successfully, render children with providers
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}
