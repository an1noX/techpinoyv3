
import { v4 as uuidv4 } from 'uuid';
import { query, checkConnection, initializeDatabase } from '@/services/db';
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

// Helper function to convert date objects to MySQL format
function formatDate(date: Date | null): string | null {
  if (!date) return null;
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// Function to initialize MariaDB schema
export async function initializeMariaDBSchema(): Promise<boolean> {
  try {
    const connected = await checkConnection();
    if (!connected) {
      console.error('Cannot connect to MariaDB');
      return false;
    }
    
    return await initializeDatabase();
  } catch (error) {
    console.error('Error initializing MariaDB schema:', error);
    return false;
  }
}

// Function to migrate users from Supabase to MariaDB
export async function migrateUsers(): Promise<{ success: boolean; count: number }> {
  try {
    // Get users from Supabase
    const { data: supabaseUsers, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      throw error;
    }
    
    let count = 0;
    
    // Process each user
    for (const user of supabaseUsers.users) {
      // Check if user already exists in MariaDB
      const existingUsers = await query<any[]>('SELECT id FROM users WHERE email = ?', [user.email]);
      
      if (existingUsers.length === 0) {
        // Create a password hash (since we can't migrate the actual password)
        const tempPassword = uuidv4().substring(0, 8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        // Insert user
        await query(
          'INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          [user.id, user.email, hashedPassword, formatDate(new Date(user.created_at)), formatDate(new Date())]
        );
        
        // Get profile data from Supabase
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        // Insert profile
        if (profileData) {
          await query(
            'INSERT INTO profiles (id, first_name, last_name, department, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              user.id,
              profileData.first_name || null,
              profileData.last_name || null,
              profileData.department || null,
              profileData.role || 'client',
              formatDate(new Date(profileData.created_at)),
              formatDate(new Date(profileData.updated_at))
            ]
          );
        } else {
          // Create default profile if none exists
          await query(
            'INSERT INTO profiles (id, role, created_at, updated_at) VALUES (?, ?, ?, ?)',
            [user.id, 'client', formatDate(new Date()), formatDate(new Date())]
          );
        }
        
        count++;
      }
    }
    
    return { success: true, count };
  } catch (error) {
    console.error('Error migrating users:', error);
    return { success: false, count: 0 };
  }
}

// Function to migrate clients from Supabase to MariaDB
export async function migrateClients(): Promise<{ success: boolean; count: number }> {
  try {
    // Get clients from Supabase
    const { data: supabaseClients, error } = await supabase
      .from('clients')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    let count = 0;
    
    // Process each client
    for (const client of supabaseClients || []) {
      // Check if client already exists in MariaDB
      const existingClients = await query<any[]>('SELECT id FROM clients WHERE id = ?', [client.id]);
      
      if (existingClients.length === 0) {
        // Insert client
        await query(
          `INSERT INTO clients 
           (id, name, company, email, phone, address, notes, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            client.id,
            client.name,
            client.company,
            client.email,
            client.phone,
            client.address,
            client.notes,
            formatDate(new Date(client.created_at)),
            formatDate(new Date(client.updated_at))
          ]
        );
        
        count++;
      }
    }
    
    return { success: true, count };
  } catch (error) {
    console.error('Error migrating clients:', error);
    return { success: false, count: 0 };
  }
}

// Function to migrate printers from Supabase to MariaDB
export async function migratePrinters(): Promise<{ success: boolean; count: number }> {
  try {
    // Get printers from Supabase
    const { data: supabasePrinters, error } = await supabase
      .from('printers')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    let count = 0;
    
    // Process each printer
    for (const printer of supabasePrinters || []) {
      // Check if printer already exists in MariaDB
      const existingPrinters = await query<any[]>('SELECT id FROM printers WHERE id = ?', [printer.id]);
      
      if (existingPrinters.length === 0) {
        // Insert printer
        await query(
          `INSERT INTO printers 
           (id, make, model, series, status, owned_by, assigned_to, client_id, 
            department, location, is_for_rent, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            printer.id,
            printer.make,
            printer.model,
            printer.series,
            printer.status,
            printer.owned_by,
            printer.assigned_to,
            printer.client_id,
            printer.department,
            printer.location,
            printer.is_for_rent || false,
            formatDate(new Date(printer.created_at)),
            formatDate(new Date(printer.updated_at))
          ]
        );
        
        count++;
      }
    }
    
    return { success: true, count };
  } catch (error) {
    console.error('Error migrating printers:', error);
    return { success: false, count: 0 };
  }
}

// Main migration function
export async function migrateFromSupabase(): Promise<{ 
  success: boolean; 
  results: {
    schema: boolean;
    users: { success: boolean; count: number };
    clients: { success: boolean; count: number };
    printers: { success: boolean; count: number };
  }
}> {
  try {
    // Initialize schema first
    const schemaInitialized = await initializeMariaDBSchema();
    
    if (!schemaInitialized) {
      return { 
        success: false, 
        results: { 
          schema: false, 
          users: { success: false, count: 0 },
          clients: { success: false, count: 0 },
          printers: { success: false, count: 0 }
        } 
      };
    }
    
    // Migrate users
    const usersMigration = await migrateUsers();
    
    // Migrate clients
    const clientsMigration = await migrateClients();
    
    // Migrate printers
    const printersMigration = await migratePrinters();
    
    // Overall success is determined by the success of all migrations
    const success = usersMigration.success && clientsMigration.success && printersMigration.success;
    
    return {
      success,
      results: {
        schema: schemaInitialized,
        users: usersMigration,
        clients: clientsMigration,
        printers: printersMigration
      }
    };
  } catch (error) {
    console.error('Error during migration:', error);
    return { 
      success: false, 
      results: { 
        schema: false, 
        users: { success: false, count: 0 },
        clients: { success: false, count: 0 },
        printers: { success: false, count: 0 }
      } 
    };
  }
}
