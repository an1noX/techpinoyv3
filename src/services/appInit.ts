
import { checkConnection, initializeDatabase } from './db';
import { useToast } from '@/hooks/use-toast';

interface InitializeAppResult {
  success: boolean;
  message: string;
}

// Function to initialize the app on startup
export async function initializeApp(): Promise<InitializeAppResult> {
  try {
    // Check database connection
    const connected = await checkConnection();
    
    if (!connected) {
      console.error('Failed to connect to MariaDB');
      return {
        success: false,
        message: 'Failed to connect to the database. Please check your connection settings.'
      };
    }
    
    // Initialize database schema if needed
    const initialized = await initializeDatabase();
    
    if (!initialized) {
      console.error('Failed to initialize database schema');
      return {
        success: false,
        message: 'Failed to initialize database schema. Please check the logs for details.'
      };
    }
    
    console.log('App initialization complete: Database connected and schema initialized');
    
    return {
      success: true,
      message: 'App initialized successfully. Database is connected and schema is loaded.'
    };
  } catch (error) {
    console.error('Error during app initialization:', error);
    
    return {
      success: false,
      message: `App initialization error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Hook to handle app initialization with toast notifications
export function useAppInitializer() {
  const { toast } = useToast();
  
  const initialize = async (): Promise<boolean> => {
    const result = await initializeApp();
    
    if (result.success) {
      toast({
        title: 'App Initialized',
        description: result.message,
      });
      return true;
    } else {
      toast({
        title: 'Initialization Failed',
        description: result.message,
        variant: 'destructive'
      });
      return false;
    }
  };
  
  return { initialize };
}
