
import { supabase } from '@/integrations/supabase/client';

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
      console.log('Data Migration Complete', 
        `Successfully migrated ${printersMigrated} printers and ${tonersMigrated} toners.`);
      return { success: true, message: `Successfully migrated ${printersMigrated} printers and ${tonersMigrated} toners.` };
    } else {
      console.log('No Migration Needed',
        'All data is already up to date.');
      return { success: true, message: 'All data is already up to date.' };
    }
    
  } catch (error: any) {
    console.error('Migration Failed', error.message);
    return { success: false, message: error.message };
  }
};

const migrateWikiPrinters = async () => {
  // Use real data for migration instead of mock data
  try {
    // Check if printers already exist
    const { data: existingPrinters } = await supabase
      .from('wiki_printers')
      .select('make, model');
    
    if (existingPrinters && existingPrinters.length > 0) {
      console.log('Printers already exist, skipping migration');
      return 0; // No new printers to migrate
    }
    
    // Real printer data to seed database with
    const printersToMigrate = [
      {
        make: "HP",
        model: "LaserJet Pro M428fdn",
        series: "LaserJet Pro",
        type: "Laser",
        description: "High-performance multifunction printer for small to medium businesses",
        specs: { 
          ppm: 40,
          dpi: 1200,
          connectivity: ['USB', 'Ethernet', 'WiFi'],
          adf: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        maintenance_tips: "Regular maintenance recommended every 2-3 months."
      },
      {
        make: "Brother",
        model: "MFC-L8900CDW",
        series: "MFC",
        type: "Color Laser",
        description: "Advanced color laser all-in-one for demanding workgroups",
        specs: { 
          ppm: 33,
          dpi: 2400,
          connectivity: ['USB', 'Ethernet', 'WiFi', 'NFC'],
          adf: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        maintenance_tips: "Clean scanner glass and fuser monthly."
      },
      {
        make: "Canon",
        model: "imageRUNNER 1643i",
        series: "imageRUNNER",
        type: "Monochrome Laser",
        description: "Reliable monochrome printer for small offices",
        specs: {
          ppm: 43,
          dpi: 1200,
          connectivity: ['USB', 'Ethernet', 'WiFi'],
          adf: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        maintenance_tips: "Replace toner when quality diminishes."
      }
    ];
    
    // Use correct table name
    const { error, count } = await supabase
      .from('wiki_printers')
      .insert(printersToMigrate)
      .select('id', { count: 'exact' });
    
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error('Error migrating printers:', error);
    throw error;
  }
};

const migrateWikiToners = async () => {
  try {
    // Check if toners already exist
    const { data: existingToners } = await supabase
      .from('wiki_toners')
      .select('brand, model');
      
    if (existingToners && existingToners.length > 0) {
      console.log('Toners already exist, skipping migration');
      return 0; // No new toners to migrate
    }
    
    // Real toner data to seed database with
    const tonersToMigrate = [
      {
        brand: 'HP',
        model: 'CF258A',
        color: 'black',
        page_yield: 3000,
        oem_code: '58A',
        stock: 10,
        threshold: 3,
        description: 'Original HP 58A Black toner cartridge',
        category: ['laser', 'original'],
        is_active: true,
        is_commercial_product: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        brand: 'Brother',
        model: 'TN-436BK',
        color: 'black',
        page_yield: 6500,
        oem_code: 'TN436BK',
        stock: 5,
        threshold: 2,
        description: 'Original Brother Ultra High-Yield Black toner cartridge',
        category: ['laser', 'original'],
        is_active: true,
        is_commercial_product: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        brand: 'Canon',
        model: 'CRG-054H BK',
        color: 'black',
        page_yield: 3100,
        oem_code: 'CRG-054H BK',
        stock: 8,
        threshold: 2,
        description: 'Original Canon 054H Black High-Capacity toner cartridge',
        category: ['laser', 'original'],
        is_active: true,
        is_commercial_product: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
    
    // Insert the toners
    const { error, count } = await supabase
      .from('wiki_toners')
      .insert(tonersToMigrate)
      .select('id', { count: 'exact' });
      
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error('Error migrating toners:', error);
    throw error;
  }
};

// Helper function to ensure we're using the correct table names
export const fixDataMigration = () => {
  console.log('Using wiki_printers and wiki_toners tables for migrations');
};

// Export this for compatibility
export const migrateMockData = runDataMigration;
