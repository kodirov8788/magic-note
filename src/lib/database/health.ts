import { Pool } from "pg";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL,
});

export async function checkDatabaseHealth() {
  const client = await pool.connect();

  try {
    // Test basic connection
    await client.query("SELECT 1");

    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('folders', 'notes')
    `);

    const tables = tablesResult.rows.map((row) => row.table_name);

    // Check RLS policies
    const policiesResult = await client.query(`
      SELECT schemaname, tablename, policyname 
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename IN ('folders', 'notes')
    `);

    const policies = policiesResult.rows.length;

    return {
      status: "healthy",
      tables: tables,
      policies: policies,
      message: `Database is healthy. Found ${tables.length} tables and ${policies} RLS policies.`,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Database health check failed.",
    };
  } finally {
    client.release();
  }
}

export async function closeConnection() {
  await pool.end();
}
