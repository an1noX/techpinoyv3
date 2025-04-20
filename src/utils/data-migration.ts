import { supabase } from '@/integrations/supabase/client';
import { Printer, Rental, CommercialTonerProduct, Toner } from '@/types';
import { Database } from '@/integrations/supabase/types';

type DatabasePrinter = Database['public']['Tables']['printers']['Insert'];
type DatabaseRental = Database['public']['Tables']['rentals']['Insert'];
type DatabaseWikiPrinter = Database['public']['Tables']['printer_wiki']['Insert'];
type DatabaseClient = Database['public']['Tables']['clients']['Insert'];
type DatabasePrinterClientAssignment = Database['public']['Tables']['printer_client_assignments']['Insert'];

// Initial commercial toner products for inventory management
const initialTonerProducts = [
  {
    sku: "CF217A",
    name: "HP 17A Black Original LaserJet Toner",
    description: "Original HP toner cartridge for M102, M130 series",
    price: 69.99,
    stock_level: 15,
    reorder_point: 5,
    category: ["HP", "Black", "Original"],
    image_url: "https://example.com/toners/hp-17a.jpg",
    is_active: true,
    compatible_printers: ["HP LaserJet Pro M102a", "HP LaserJet Pro M130fn"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    sku: "TN760",
    name: "Brother TN-760 High Yield Toner",
    description: "High-yield Brother original toner cartridge",
    price: 79.99,
    stock_level: 12,
    reorder_point: 4,
    category: ["Brother", "Black", "Original", "High Yield"],
    image_url: "https://example.com/toners/tn-760.jpg",
    is_active: true,
    compatible_printers: ["Brother HL-L2350DW", "Brother MFC-L2710DW"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    sku: "CE285A",
    name: "HP 85A Black Original LaserJet Toner",
    description: "Original HP toner for P1102 series printers",
    price: 64.99,
    stock_level: 20,
    reorder_point: 8,
    category: ["HP", "Black", "Original"],
    image_url: "https://example.com/toners/hp-85a.jpg",
    is_active: true,
    compatible_printers: ["HP LaserJet P1102w", "HP LaserJet Pro M1212nf"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    sku: "CLT-K506L",
    name: "Samsung 506L Black Toner",
    description: "High-yield Samsung original black toner",
    price: 89.99,
    stock_level: 8,
    reorder_point: 3,
    category: ["Samsung", "Black", "Original", "High Yield"],
    image_url: "https://example.com/toners/samsung-506l.jpg",
    is_active: true,
    compatible_printers: ["Samsung CLP-680ND", "Samsung CLX-6260FW"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    sku: "TK-5244K",
    name: "Kyocera TK-5244K Black Toner",
    description: "Original Kyocera black toner cartridge",
    price: 129.99,
    stock_level: 6,
    reorder_point: 2,
    category: ["Kyocera", "Black", "Original"],
    image_url: "https://example.com/toners/tk-5244k.jpg",
    is_active: true,
    compatible_printers: ["Kyocera ECOSYS M5526cdw", "Kyocera ECOSYS P5026cdw"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

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

    // Insert wiki printers one by one to avoid array/object type conflicts
    for (const printer of mockWikiPrinters) {
      const { error } = await supabase
        .from('printer_wiki')
        .upsert(
          { 
            ...printer,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'make,series,model' }
        );

      if (error) {
        console.error('Error migrating wiki printer:', error);
      }
    }

    // Get the wiki printer IDs
    const { data: wikiPrinters, error: wikiError } = await supabase
      .from('printer_wiki')
      .select('id, make, series, model');

    if (wikiError || !wikiPrinters || wikiPrinters.length === 0) {
      throw new Error('Failed to retrieve wiki printers: ' + (wikiError?.message || 'No printers found'));
    }

    // Add mock clients
    const mockClients: DatabaseClient[] = [
      {
        name: 'Acme Corp',
        company: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '555-123-4567',
        address: '123 Acme Street, Acme City'
      },
      {
        name: 'TechSolutions Inc',
        company: 'TechSolutions',
        email: 'info@techsolutions.com',
        phone: '555-987-6543',
        address: '456 Tech Blvd, Innovation Valley'
      },
      {
        name: 'Global Enterprises',
        company: 'Global Inc',
        email: 'global@enterprises.com',
        phone: '555-456-7890',
        address: '789 Global Avenue, Metropolis'
      }
    ];

    // Insert clients
    const insertedClients = [];
    for (const client of mockClients) {
      const { data, error } = await supabase
        .from('clients')
        .upsert({
          ...client,
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Error migrating client:', error);
      } else if (data && data.length > 0) {
        insertedClients.push(data[0]);
      }
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
        assigned_to: insertedClients.length > 0 ? insertedClients[0].name : 'Acme Corp',
        client_id: insertedClients.length > 0 ? insertedClients[0].id : null,
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
        assigned_to: insertedClients.length > 1 ? insertedClients[1].name : 'TechSolutions Inc',
        client_id: insertedClients.length > 1 ? insertedClients[1].id : null,
        department: 'IT',
        location: 'Floor 3, Room 302',
        is_for_rent: false
      },
    ];

    // Insert printers one by one to avoid array/object type conflicts
    const insertedPrinters = [];
    for (const printer of mockPrinters) {
      const { data, error } = await supabase
        .from('printers')
        .upsert({
          ...printer,
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Error migrating printer:', error);
      } else if (data && data.length > 0) {
        insertedPrinters.push(data[0]);
      }
    }

    // Create printer-client assignments for assigned printers
    if (insertedPrinters.length > 0 && insertedClients.length > 0) {
      // Filter printers that are assigned to clients
      const assignedPrinters = insertedPrinters.filter(p => p.client_id);
      
      for (const printer of assignedPrinters) {
        const assignment: DatabasePrinterClientAssignment = {
          printer_id: printer.id,
          client_id: printer.client_id!,
          created_by: 'system',
          notes: 'Initial assignment from data migration.'
        };

        const { error } = await supabase
          .from('printer_client_assignments')
          .insert(assignment);

        if (error) {
          console.error('Error creating printer assignment:', error);
        }
      }
    }

    // Add rental options for rentable printers
    if (insertedPrinters.length > 0) {
      const rentalPrinters = insertedPrinters.filter(p => p.is_for_rent);
      
      for (const printer of rentalPrinters) {
        const rentalOption = {
          printer_id: printer.id,
          is_for_rent: true,
          rental_rate: Math.floor(Math.random() * 100) + 50, // Random rate between 50-150
          rate_unit: 'daily',
          minimum_duration: 7,
          duration_unit: 'days',
          security_deposit: 200,
          terms: 'Standard rental terms apply.',
          cancellation_policy: 'Cancellation allowed up to 48 hours prior to start date.'
        };

        const { error } = await supabase
          .from('rental_options')
          .upsert(rentalOption, { onConflict: 'printer_id' });

        if (error) {
          console.error('Error migrating rental option:', error);
        }
      }
    }

    // Add mock rentals
    if (insertedPrinters.length >= 2) {
      const mockRentals: DatabaseRental[] = [
        { 
          printer_id: insertedPrinters[0].id,
          client_id: insertedClients.length > 0 ? insertedClients[0].id : null,
          client: insertedClients.length > 0 ? insertedClients[0].name : 'Acme Corp',
          printer: `${insertedPrinters[0].make} ${insertedPrinters[0].model}`,
          start_date: '2023-04-10',
          end_date: '2023-06-10',
          status: 'active',
          inquiry_count: 3,
          booking_count: 1,
          next_available_date: '2023-06-11'
        },
        { 
          printer_id: insertedPrinters[1].id,
          client_id: insertedClients.length > 1 ? insertedClients[1].id : null,
          client: insertedClients.length > 1 ? insertedClients[1].name : 'TechSolutions Inc',
          printer: `${insertedPrinters[1].make} ${insertedPrinters[1].model}`,
          start_date: '2023-03-15',
          end_date: '2023-05-15',
          status: 'active',
          inquiry_count: 2,
          booking_count: 1,
          next_available_date: '2023-05-16'
        },
      ];

      // Insert rentals one by one to avoid array/object type conflicts
      for (const rental of mockRentals) {
        const { error } = await supabase
          .from('rentals')
          .upsert({
            ...rental,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error migrating rental:', error);
        }
      }
    }

    console.log('Data migration completed successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Data migration failed:', error);
    return { success: false, error };
  }
};

// Function to migrate initial toner products
export const migrateInitialTonerProducts = async () => {
  try {
    console.log('Starting toner products migration...');

    // Initialize base toner records with commercial product data
    const tonerProducts = [
      {
        brand: 'HP',
        model: 'CF217A',
        color: 'black',
        oem_code: '17A',
        page_yield: 1600,
        aliases: ['17A', 'CF217A'],
        // Commercial product fields
        is_commercial_product: true,
        price: 69.99,
        stock: 15,
        threshold: 5,
        category: ['HP', 'Black', 'Original'],
        image_url: 'https://example.com/toners/hp-17a.jpg',
        description: 'Original HP toner cartridge for M102, M130 series',
        is_active: true,
        compatible_printers: ['HP LaserJet Pro M102a', 'HP LaserJet Pro M130fn'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        brand: 'Brother',
        model: 'TN760',
        color: 'black',
        oem_code: 'TN-760',
        page_yield: 3000,
        aliases: ['TN760', 'TN-760'],
        // Commercial product fields
        is_commercial_product: true,
        price: 79.99,
        stock: 12,
        threshold: 4,
        category: ['Brother', 'Black', 'Original', 'High Yield'],
        image_url: 'https://example.com/toners/tn-760.jpg',
        description: 'High-yield Brother original toner cartridge',
        is_active: true,
        compatible_printers: ['Brother HL-L2350DW', 'Brother MFC-L2710DW'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Insert toner products
    for (const product of tonerProducts) {
      const { error } = await supabase
        .from('toners')
        .upsert(product);

      if (error) {
        console.error('Error inserting toner product:', error);
        continue;
      }
    }

    console.log('Toner products migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};
