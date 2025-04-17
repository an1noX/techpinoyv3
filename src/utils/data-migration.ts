
import { supabase } from '@/integrations/supabase/client';
import { Printer, Rental } from '@/types';
import { Database } from '@/integrations/supabase/types';

type DatabasePrinter = Database['public']['Tables']['printers']['Insert'];
type DatabaseRental = Database['public']['Tables']['rentals']['Insert'];
type DatabaseWikiPrinter = Database['public']['Tables']['printer_wiki']['Insert'];

// Migration script to push mock data to Supabase
export const migrateMockData = async () => {
  try {
    // First, add printer models to the Wiki (master list)
    const mockWikiPrinters: DatabaseWikiPrinter[] = [
      { 
        make: 'HP', 
        series: 'LaserJet', 
        model: 'Pro MFP M428fdn',
        specs: {
          'resolution': '1200 x 1200 dpi',
          'paperSize': 'A4, Letter, Legal',
          'connectivity': 'USB, Ethernet, WiFi',
          'printSpeed': '40 ppm'
        },
        maintenance_tips: 'Replace toner when low, clean monthly.'
      },
      { 
        make: 'Brother', 
        series: 'MFC', 
        model: 'L8900CDW',
        specs: {
          'resolution': '2400 x 600 dpi',
          'paperSize': 'A4, Letter, Legal',
          'connectivity': 'USB, Ethernet, WiFi, NFC',
          'printSpeed': '33 ppm'
        },
        maintenance_tips: 'Check drum unit every 15,000 pages.'
      },
      { 
        make: 'Canon', 
        series: 'imageRUNNER', 
        model: '1643i',
        specs: {
          'resolution': '600 x 600 dpi',
          'paperSize': 'A4, Letter, Legal',
          'connectivity': 'USB, Ethernet',
          'printSpeed': '43 ppm'
        },
        maintenance_tips: 'Regular firmware updates recommended.'
      },
    ];

    // Insert wiki printers
    const { error: wikiError, data: wikiData } = await supabase
      .from('printer_wiki')
      .upsert(
        mockWikiPrinters.map(printer => ({
          ...printer,
          updated_at: new Date().toISOString()
        })),
        { onConflict: 'make,series,model', returning: 'minimal' }
      );

    if (wikiError) {
      console.error('Error migrating wiki printers:', wikiError);
    }

    // Get the wiki printer IDs
    const { data: wikiPrinters } = await supabase
      .from('printer_wiki')
      .select('id, make, series, model');

    if (!wikiPrinters || wikiPrinters.length === 0) {
      throw new Error('Failed to retrieve wiki printers');
    }

    // Then, add actual printer instances referencing wiki models
    const mockPrinters: DatabasePrinter[] = [
      { 
        make: wikiPrinters[0].make, 
        series: wikiPrinters[0].series, 
        model: wikiPrinters[0].model,
        status: 'available',
        owned_by: 'system',
        department: 'Marketing',
        location: 'Floor 2, Room 201',
        is_for_rent: true
      },
      { 
        make: wikiPrinters[1].make, 
        series: wikiPrinters[1].series, 
        model: wikiPrinters[1].model,
        status: 'rented',
        owned_by: 'system',
        assigned_to: 'Acme Corp',
        department: 'Sales',
        location: 'Floor 1, Room 105',
        is_for_rent: true
      },
      { 
        make: wikiPrinters[2].make, 
        series: wikiPrinters[2].series, 
        model: wikiPrinters[2].model,
        status: 'maintenance',
        owned_by: 'client',
        assigned_to: 'TechSolutions Inc',
        department: 'IT',
        location: 'Floor 3, Room 302',
        is_for_rent: false
      },
    ];

    // Insert printers
    const { error: printersError, data: printersData } = await supabase
      .from('printers')
      .upsert(
        mockPrinters.map(printer => ({
          ...printer,
          updated_at: new Date().toISOString()
        })),
        { onConflict: 'id', returning: 'representation' }
      );

    if (printersError) {
      console.error('Error migrating printers:', printersError);
    }

    // Add rental options for rentable printers
    if (printersData) {
      const rentalPrinters = printersData.filter(p => p.is_for_rent);
      
      const rentalOptions = rentalPrinters.map(printer => ({
        printer_id: printer.id,
        is_for_rent: true,
        rental_rate: Math.floor(Math.random() * 100) + 50, // Random rate between 50-150
        rate_unit: 'daily',
        minimum_duration: 7,
        duration_unit: 'days',
        security_deposit: 200,
        terms: 'Standard rental terms apply.',
        cancellation_policy: 'Cancellation allowed up to 48 hours prior to start date.'
      }));

      const { error: optionsError } = await supabase
        .from('rental_options')
        .upsert(rentalOptions, { onConflict: 'printer_id' });

      if (optionsError) {
        console.error('Error migrating rental options:', optionsError);
      }
    }

    // Add mock rentals
    if (printersData && printersData.length >= 2) {
      const mockRentals: DatabaseRental[] = [
        { 
          printer_id: printersData[0].id,
          client: 'Acme Corp',
          printer: `${printersData[0].make} ${printersData[0].model}`,
          start_date: '2023-04-10',
          end_date: '2023-06-10',
          status: 'active',
          inquiry_count: 3,
          booking_count: 1,
          next_available_date: '2023-06-11'
        },
        { 
          printer_id: printersData[1].id,
          client: 'TechSolutions Inc',
          printer: `${printersData[1].make} ${printersData[1].model}`,
          start_date: '2023-03-15',
          end_date: '2023-05-15',
          status: 'active',
          inquiry_count: 2,
          booking_count: 1,
          next_available_date: '2023-05-16'
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
    }

    console.log('Data migration completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Data migration failed:', error);
    return { success: false, error };
  }
};
