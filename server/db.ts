import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '@db/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000, // Increased timeout
});

// Add error handler for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit the process, just log the error
  console.error('Database connection error:', err);
});

async function waitForConnection(maxAttempts = 5) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1'); // Verify we can actually execute queries
      console.log('Database connection successful');
      client.release();
      return true;
    } catch (err) {
      console.error(`Database connection attempt ${attempt}/${maxAttempts} failed:`, err);
      if (attempt < maxAttempts) {
        console.log(`Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  return false;
}

// Export the connection test with retry mechanism
export const testDatabaseConnection = waitForConnection;

// Export the database instance
export const db = drizzle(pool, { schema });