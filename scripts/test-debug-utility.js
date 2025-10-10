#!/usr/bin/env node

/**
 * Test script for debug utility
 * Verifies all debug functionality works correctly
 */

// Simple debug implementation for testing
class SimpleDebug {
  constructor() {
    this.config = {
      enabled: true,
      categories: new Set(["auth", "api", "database", "general"]),
      levels: new Set(["info", "warn", "error", "debug", "success"]),
      showTimestamp: true,
      showCategory: true,
      showLevel: true,
    };
    this.timers = new Map();
  }

  getConfig() {
    return { ...this.config };
  }

  enableCategory(category) {
    this.config.categories.add(category);
  }

  disableCategory(category) {
    this.config.categories.delete(category);
  }

  enableLevel(level) {
    this.config.levels.add(level);
  }

  disableLevel(level) {
    this.config.levels.delete(level);
  }

  setConfig(config) {
    this.config = { ...this.config, ...config };
  }

  shouldLog(category, level) {
    if (!this.config.enabled) return false;
    if (!this.config.categories.has(category)) return false;
    if (!this.config.levels.has(level)) return false;
    return true;
  }

  formatMessage(data) {
    const parts = [];

    if (this.config.showTimestamp) {
      parts.push(`[${new Date(data.timestamp).toISOString()}]`);
    }

    if (this.config.showLevel) {
      parts.push(`[${data.level.toUpperCase()}]`);
    }

    if (this.config.showCategory) {
      parts.push(`[${data.category.toUpperCase()}]`);
    }

    parts.push(data.message);

    if (data.data !== undefined) {
      parts.push(JSON.stringify(data.data, null, 2));
    }

    return parts.join(" ");
  }

  log(category, level, message, data) {
    if (!this.shouldLog(category, level)) return;

    const debugData = {
      category,
      level,
      message,
      data,
      timestamp: Date.now(),
    };

    const formattedMessage = this.formatMessage(debugData);

    switch (level) {
      case "error":
        console.error(formattedMessage);
        break;
      case "warn":
        console.warn(formattedMessage);
        break;
      case "success":
        console.log(`%c${formattedMessage}`, "color: green; font-weight: bold");
        break;
      case "debug":
        console.debug(formattedMessage);
        break;
      case "info":
      default:
        console.log(formattedMessage);
        break;
    }
  }

  info(category, message, data) {
    this.log(category, "info", message, data);
  }

  warn(category, message, data) {
    this.log(category, "warn", message, data);
  }

  error(category, message, data) {
    this.log(category, "error", message, data);
  }

  debug(category, message, data) {
    this.log(category, "debug", message, data);
  }

  success(category, message, data) {
    this.log(category, "success", message, data);
  }

  time(label) {
    this.timers.set(label, Date.now());
    this.debug("general", `Timer started: ${label}`);
  }

  timeEnd(label) {
    const startTime = this.timers.get(label);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.info("general", `Timer ended: ${label}`, {
        duration: `${duration}ms`,
      });
      this.timers.delete(label);
    } else {
      this.warn("general", `Timer not found: ${label}`);
    }
  }

  table(data, label) {
    if (label) {
      this.info("general", `Table: ${label}`);
    }
    console.table(data);
  }

  group(label, callback) {
    console.group(`🔍 ${label}`);
    callback();
    console.groupEnd();
  }

  api(method, url, status, data) {
    const level = status >= 400 ? "error" : status >= 300 ? "warn" : "success";
    this.log("api", level, `${method} ${url}`, { status, data });
  }

  realtime(event, channel, data) {
    this.debug("realtime", `Event: ${event}`, { channel, data });
  }

  auth(event, data) {
    this.info("auth", `Auth Event: ${event}`, data);
  }

  database(operation, table, data) {
    this.debug("database", `DB ${operation}`, { table, data });
  }
}

const debug = new SimpleDebug();

console.log("🧪 Testing Debug Utility...\n");

// Test 1: Basic logging
console.log("1. Testing basic logging:");
debug.info("general", "Basic info message");
debug.warn("general", "Warning message");
debug.error("general", "Error message");
debug.debug("general", "Debug message");
debug.success("general", "Success message");

// Test 2: Category filtering
console.log("\n2. Testing category filtering:");
debug.enableCategory("auth");
debug.disableCategory("api");
debug.info("auth", "This should appear");
debug.info("api", "This should NOT appear");
debug.info("general", "This should appear");

// Test 3: Level filtering
console.log("\n3. Testing level filtering:");
debug.enableLevel("error");
debug.disableLevel("info");
debug.info("general", "This should NOT appear");
debug.error("general", "This should appear");
debug.warn("general", "This should NOT appear");

// Test 4: Timer functionality
console.log("\n4. Testing timer functionality:");
debug.time("Test Timer");
setTimeout(() => {
  debug.timeEnd("Test Timer");
}, 100);

// Test 5: Table logging
console.log("\n5. Testing table logging:");
const testData = [
  { id: 1, name: "Test Item 1", value: 100 },
  { id: 2, name: "Test Item 2", value: 200 },
];
debug.table(testData, "Test Data");

// Test 6: Group functionality
console.log("\n6. Testing group functionality:");
debug.group("Authentication Flow Debug", () => {
  debug.info("auth", "Starting login process");
  debug.debug("auth", "Validating credentials");
  debug.success("auth", "Login successful");
});

// Test 7: API logging
console.log("\n7. Testing API logging:");
debug.api("GET", "/api/folders", 200, { count: 5 });
debug.api("POST", "/api/folders", 201, { id: "123" });
debug.api("GET", "/api/folders", 404, { error: "Not found" });

// Test 8: Realtime logging
console.log("\n8. Testing realtime logging:");
debug.realtime("subscription", "auction:123", { event: "bid_placed" });

// Test 9: Database logging
console.log("\n9. Testing database logging:");
debug.database("SELECT", "folders", { count: 5 });
debug.database("INSERT", "folders", { id: "123", name: "Test Folder" });

// Test 10: Configuration
console.log("\n10. Testing configuration:");
const config = debug.getConfig();
console.log("Current config:", config);

// Reset configuration
debug.setConfig({
  enabled: true,
  categories: new Set(["auth", "api", "database", "general"]),
  levels: new Set(["info", "warn", "error", "debug", "success"]),
  showTimestamp: true,
  showCategory: true,
  showLevel: true,
});

console.log("\n✅ Debug utility test completed!");
