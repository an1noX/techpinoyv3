
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
  queueLimit: 0
});

// Helper to execute queries
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

// Close the connection pool (use when shutting down the app)
export async function closePool(): Promise<void> {
  await pool.end();
}
