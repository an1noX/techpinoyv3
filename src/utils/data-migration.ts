
import { supabase } from '@/integrations/supabase/client';
import type { Printer, Rental } from '@/types';

// Migration script to push mock data to Supabase
export const migrateMockData = async () => {
  try {
    // Add mock printers
    const mockPrinters: Omit<Printer, 'id' | 'createdAt' | 'updatedAt'>[] = [
      { 
        make: 'HP', 
        series: 'LaserJet', 
        model: 'Pro MFP M428fdn',
        status: 'available',
        ownedBy: 'system',
        department: 'Marketing',
        location: 'Floor 2, Room 201',
      },
      { 
        make: 'Brother', 
        series: 'MFC', 
        model: 'L8900CDW',
        status: 'rented',
        ownedBy: 'system',
        assignedTo: 'Acme Corp',
        department: 'Sales',
        location: 'Floor 1, Room 105',
      },
      { 
        make: 'Canon', 
        series: 'imageRUNNER', 
        model: '1643i',
        status: 'maintenance',
        ownedBy: 'client',
        assignedTo: 'TechSolutions Inc',
        department: 'IT',
        location: 'Floor 3, Room 302',
      },
    ];

    // Insert printers
    const { error: printersError } = await supabase
      .from('printers')
      .upsert(
        mockPrinters.map(printer => ({
          ...printer,
          updated_at: new Date().toISOString()
        })),
        { onConflict: 'make,model' }
      );

    if (printersError) {
      console.error('Error migrating printers:', printersError);
    }

    // Add mock rentals
    const { data: printerId1 } = await supabase
      .from('printers')
      .select('id')
      .eq('make', 'HP')
      .eq('model', 'Pro MFP M428fdn')
      .single();

    const { data: printerId2 } = await supabase
      .from('printers')
      .select('id')
      .eq('make', 'Brother')
      .eq('model', 'L8900CDW')
      .single();

    const mockRentals = [
      { 
        printer_id: printerId1?.id,
        client: 'Acme Corp',
        printer: 'HP LaserJet Pro MFP M428fdn',
        start_date: '2023-04-10',
        end_date: '2023-06-10',
        status: 'active',
      },
      { 
        printer_id: printerId2?.id,
        client: 'TechSolutions Inc',
        printer: 'Brother MFC-L8900CDW',
        start_date: '2023-03-15',
        end_date: '2023-05-15',
        status: 'active',
      },
    ];

    // Insert rentals
    const { error: rentalsError } = await supabase
      .from('rentals')
      .upsert(
        mockRentals.map(rental => ({
          ...rental,
          updated_at: new Date().toISOString()
        })),
        { onConflict: 'id' }
      );

    if (rentalsError) {
      console.error('Error migrating rentals:', rentalsError);
    }

    console.log('Data migration completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Data migration failed:', error);
    return { success: false, error };
  }
};
