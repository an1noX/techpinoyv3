
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
  charset: 'utf8mb4'
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
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Function to initialize the database with schema
export async function initializeDatabase(): Promise<boolean> {
  try {
    const fs = require('fs');
    const path = require('path');
    const schema = fs.readFileSync(path.join(process.cwd(), 'src/services/schema.sql'), 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .filter((statement: string) => statement.trim() !== '');
    
    // Execute each statement
    for (const statement of statements) {
      await pool.query(`${statement};`);
    }
    
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}
