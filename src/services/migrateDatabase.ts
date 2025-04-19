
import { query, checkConnection } from './db';
import { promises as fs } from 'fs';
import * as path from 'path';

interface MigrationResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Initialize the database schema
 */
export async function initializeSchema(): Promise<MigrationResult> {
  try {
    const connected = await checkConnection();
    
    if (!connected) {
      return { 
        success: false, 
        message: "Failed to connect to MariaDB. Please check your database configuration." 
      };
    }
    
    // Read the schema SQL file
    const schemaPath = path.join(process.cwd(), 'src/services/schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schemaSql
      .split(';')
      .filter((statement: string) => statement.trim() !== '');
    
    // Execute each statement
    for (const statement of statements) {
      await query(`${statement};`);
    }
    
    return { 
      success: true, 
      message: "Database schema initialized successfully" 
    };
  } catch (error) {
    console.error('Error initializing schema:', error);
    return { 
      success: false, 
      message: `Failed to initialize schema: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

/**
 * Seed the database with initial data
 */
export async function seedDatabase(): Promise<MigrationResult> {
  try {
    const connected = await checkConnection();
    
    if (!connected) {
      return { 
        success: false, 
        message: "Failed to connect to MariaDB. Please check your database configuration." 
      };
    }
    
    // Check if the database already has data (to avoid duplicate seeding)
    const usersResult = await query<any[]>('SELECT COUNT(*) as count FROM users');
    
    if (usersResult[0].count > 0) {
      return { 
        success: true, 
        message: "Database already contains data, skipping seed operation." 
      };
    }
    
    // Read the seed SQL file
    const seedPath = path.join(process.cwd(), 'src/services/seed-data.sql');
    const seedSql = await fs.readFile(seedPath, 'utf8');
    
    // Split the seed SQL into individual statements
    const statements = seedSql
      .split(';')
      .filter((statement: string) => statement.trim() !== '');
    
    // Execute each statement
    for (const statement of statements) {
      await query(`${statement};`);
    }
    
    return { 
      success: true, 
      message: "Database seeded successfully with initial data." 
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { 
      success: false, 
      message: `Failed to seed database: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

/**
 * Migrate database: initialize schema and seed data
 */
export async function migrateDatabase(): Promise<MigrationResult> {
  try {
    // Initialize schema
    const schemaResult = await initializeSchema();
    
    if (!schemaResult.success) {
      return schemaResult;
    }
    
    // Seed database
    const seedResult = await seedDatabase();
    
    return { 
      success: true, 
      message: "Database migration completed successfully.", 
      details: {
        schema: schemaResult,
        seed: seedResult
      }
    };
  } catch (error) {
    console.error('Error during database migration:', error);
    return { 
      success: false, 
      message: `Database migration failed: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

/**
 * Run a database health check
 */
export async function checkDatabaseHealth(): Promise<MigrationResult> {
  try {
    const connected = await checkConnection();
    
    if (!connected) {
      return { 
        success: false, 
        message: "Failed to connect to MariaDB. Please check your database configuration." 
      };
    }
    
    // Check tables
    const tables = [
      'users', 'profiles', 'sessions', 'clients', 'printers', 
      'printer_wiki', 'rentals', 'rental_options', 'printer_client_assignments'
    ];
    
    const tableResults = {};
    
    for (const table of tables) {
      try {
        const result = await query<any[]>(`SELECT COUNT(*) as count FROM ${table}`);
        tableResults[table] = {
          exists: true,
          count: result[0].count
        };
      } catch (error) {
        tableResults[table] = {
          exists: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    
    return { 
      success: true, 
      message: "Database health check completed.", 
      details: {
        connection: true,
        tables: tableResults
      }
    };
  } catch (error) {
    console.error('Error checking database health:', error);
    return { 
      success: false, 
      message: `Database health check failed: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}
