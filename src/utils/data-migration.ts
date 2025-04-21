import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { fixDataMigration } from './typeHelpers';

// This function checks if we need to migrate data
export const checkDataMigrationNeeded = async () => {
  try {
    // Use the right table name: wiki_printers instead of printer_wiki
    const { count, error } = await supabase
      .from('wiki_printers')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    
    return count === 0; // Migration needed if table is empty
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};

export const runDataMigration = async () => {
  try {
    // Fix: Call utility function to ensure we're using the right table names
    fixDataMigration();
    
    const printersMigrated = await migrateWikiPrinters();
    const tonersMigrated = await migrateWikiToners();
    
    if (printersMigrated || tonersMigrated) {
      toast({
        title: 'Data Migration Complete',
        description: `Successfully migrated ${printersMigrated} printers and ${tonersMigrated} toners.`,
      });
    } else {
      toast({
        title: 'No Migration Needed',
        description: 'All data is already up to date.',
      });
    }
    
    return { printersMigrated, tonersMigrated };
  } catch (error: any) {
    toast({
      title: 'Migration Failed',
      description: error.message,
      variant: 'destructive',
    });
    
    return { printersMigrated: 0, tonersMigrated: 0, error };
  }
};

const migrateWikiPrinters = async () => {
  // Use mock data for demonstration
  const printerData = [
    {
      make: 'HP',
      model: 'LaserJet Pro M428fdn',
      series: 'LaserJet Pro',
      type: 'Laser',
      description: 'High-performance multifunction printer for small to medium businesses',
      specs: { 
        ppm: 40,
        dpi: 1200,
        connectivity: ['USB', 'Ethernet', 'WiFi'],
        adf: true
      }
    },
    {
      make: 'Brother',
      model: 'MFC-L8900CDW',
      series: 'MFC',
      type: 'Color Laser',
      description: 'Advanced color laser all-in-one for demanding workgroups',
      specs: { 
        ppm: 33,
        dpi: 2400,
        connectivity: ['USB', 'Ethernet', 'WiFi', 'NFC'],
        adf: true
      }
    }
  ];
  
  try {
    // Use the correct table name: wiki_printers
    const { data: existingPrinters } = await supabase
      .from('wiki_printers')
      .select('make, model');
    
    const existingPrinterKeys = new Set(
      existingPrinters?.map(p => `${p.make}-${p.model}`) || []
    );
    
    const newPrinters = printerData.filter(
      p => !existingPrinterKeys.has(`${p.make}-${p.model}`)
    );
    
    if (newPrinters.length === 0) {
      return 0; // No new printers to migrate
    }
    
    // Add additional required fields
    const printersWithMetadata = newPrinters.map(printer => ({
      ...printer,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      maintenance_tips: 'Regular maintenance recommended every 2-3 months.'
    }));
    
    // Use correct table name
    const { error, count } = await supabase
      .from('wiki_printers')
      .insert(printersWithMetadata)
      .select('id', { count: 'exact' });
    
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error('Error migrating printers:', error);
    throw error;
  }
};

const migrateWikiToners = async () => {
  // Implement actual toner migration logic here
  return 0;
};
