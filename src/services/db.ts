
import mysql from 'mysql2/promise';

// Create a connection pool to MariaDB
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'printpal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  // Enable multiple statements to allow running migration scripts
  multipleStatements: true
});

// Helper to execute queries
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  try {
    const [rows] = await pool.execute(sql, params || []);
    return rows as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Close the connection pool (use when shutting down the app)
export async function closePool(): Promise<void> {
  await pool.end();
}

// Function to check the database connection
export async function checkConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Function to initialize the database with schema
export async function initializeDatabase(): Promise<boolean> {
  try {
    // Import the migrateDatabase function and run it
    const { migrateDatabase } = require('./migrateDatabase');
    const result = await migrateDatabase();
    
    if (!result.success) {
      console.error('Database initialization error:', result.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}
