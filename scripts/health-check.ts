#!/usr/bin/env tsx

import {
  checkDatabaseHealth,
  closeConnection,
} from "../src/lib/database/health";

async function main() {
  try {
    console.log("🔍 Checking database health...");
    const health = await checkDatabaseHealth();

    if (health.status === "healthy") {
      console.log("✅", health.message);
      console.log("📊 Tables found:", health.tables);
      console.log("🔒 RLS policies:", health.policies);
    } else {
      console.error("❌", health.message);
      console.error("Error:", health.error);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Health check failed:", error);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

main();
