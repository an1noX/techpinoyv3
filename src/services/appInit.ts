
import { checkConnection } from './db';
import { migrateDatabase, checkDatabaseHealth } from './migrateDatabase';
import { useToast } from '@/hooks/use-toast';

interface InitializeAppResult {
  success: boolean;
  message: string;
  details?: any;
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
    
    // Run database migration (schema and seed data)
    const migrationResult = await migrateDatabase();
    
    if (!migrationResult.success) {
      console.error('Failed to initialize database');
      return {
        success: false,
        message: migrationResult.message,
        details: migrationResult.details
      };
    }
    
    // Run a health check to ensure all tables are functioning
    const healthCheckResult = await checkDatabaseHealth();
    
    console.log('App initialization complete: Database connected and initialized');
    
    return {
      success: true,
      message: 'App initialized successfully. Database is connected and schema is loaded.',
      details: {
        migration: migrationResult,
        health: healthCheckResult
      }
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
