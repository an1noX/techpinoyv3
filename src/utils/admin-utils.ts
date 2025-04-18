
import { migrateMockData } from './data-migration';
import { useToast } from '@/hooks/use-toast';

export const runDataMigration = async () => {
  const { toast } = useToast();
  
  try {
    const result = await migrateMockData();
    
    if (result.success) {
      toast({
        title: "Data migration successful",
        description: "Mock data has been successfully migrated to Supabase",
      });
      return true;
    } else {
      toast({
        title: "Data migration failed",
        description: result.error?.message || "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    }
  } catch (error: any) {
    toast({
      title: "Data migration failed",
      description: error.message || "An unknown error occurred",
      variant: "destructive"
    });
    return false;
  }
};
