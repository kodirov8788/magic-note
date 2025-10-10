#!/usr/bin/env tsx

import { config } from "dotenv";
import { runMigration, closeConnection } from "../src/lib/database/migrate";

// Load environment variables
config({ path: ".env.local" });

async function main() {
  try {
    console.log("🚀 Starting database migration...");
    console.log(
      "Database URL:",
      process.env.DIRECT_DATABASE_URL ? "Set" : "Not set"
    );
    await runMigration();
    console.log("✅ Migration completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

main();
