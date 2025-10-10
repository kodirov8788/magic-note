/**
 * Debug utility for the Notes App
 * Provides structured logging with categories and levels
 *
 * Environment Variable:
 * - NEXT_PUBLIC_DEV=true: Enables debug logging in development
 *
 * When NEXT_PUBLIC_DEV=false, debug logging is disabled
 */

import type { DebugCategory, DebugLevel, DebugData } from "@/types";

interface DebugConfig {
  enabled: boolean;
  categories: Set<DebugCategory>;
  levels: Set<DebugLevel>;
  showTimestamp: boolean;
  showCategory: boolean;
  showLevel: boolean;
}

class DebugManager {
  private config: DebugConfig;

  private timers: Map<string, number> = new Map();

  constructor() {
    // Check environment variable for debug configuration
    const isDev = process.env.NEXT_PUBLIC_DEV === "true";

    this.config = {
      enabled: isDev,
      categories: new Set(["auth", "api", "database", "general"]),
      levels: new Set(["info", "warn", "error", "debug", "success"]),
      showTimestamp: true,
      showCategory: true,
      showLevel: true,
    };

    // Log debug configuration (only if enabled)
    if (isDev) {
      console.log(`[DEBUG] Debug utility initialized:`, {
        enabled: isDev,
        NEXT_PUBLIC_DEV: process.env.NEXT_PUBLIC_DEV,
      });
    }
  }

  /**
   * Get current debug configuration
   */
  getConfig(): DebugConfig {
    return { ...this.config };
  }

  /**
   * Enable a specific debug category
   */
  enableCategory(category: DebugCategory): void {
    this.config.categories.add(category);
  }

  /**
   * Disable a specific debug category
   */
  disableCategory(category: DebugCategory): void {
    this.config.categories.delete(category);
  }

  /**
   * Enable a specific debug level
   */
  enableLevel(level: DebugLevel): void {
    this.config.levels.add(level);
  }

  /**
   * Disable a specific debug level
   */
  disableLevel(level: DebugLevel): void {
    this.config.levels.delete(level);
  }

  /**
   * Set debug configuration
   */
  setConfig(config: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if debug should be logged
   */
  private shouldLog(category: DebugCategory, level: DebugLevel): boolean {
    if (!this.config.enabled) return false;
    if (!this.config.categories.has(category)) return false;
    if (!this.config.levels.has(level)) return false;
    return true;
  }

  /**
   * Format debug message
   */
  private formatMessage(data: DebugData): string {
    const parts: string[] = [];

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

  /**
   * Log debug message
   */
  private log(
    category: DebugCategory,
    level: DebugLevel,
    message: string,
    data?: Record<string, unknown> | Error | unknown
  ): void {
    if (!this.shouldLog(category, level)) return;

    // Convert error objects to serializable format
    let serializedData: Record<string, unknown> | undefined;
    if (data !== undefined) {
      if (data instanceof Error) {
        serializedData = {
          name: data.name,
          message: data.message,
          stack: data.stack,
        };
      } else if (typeof data === "object" && data !== null) {
        serializedData = data as Record<string, unknown>;
      } else {
        serializedData = { value: data };
      }
    }

    const debugData: DebugData = {
      category,
      level,
      message,
      data: serializedData,
      timestamp: Date.now(),
    };

    const formattedMessage = this.formatMessage(debugData);

    // Use appropriate console method based on level
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

  /**
   * Log info message
   */
  info(
    category: DebugCategory,
    message: string,
    data?: Record<string, unknown> | Error | unknown
  ): void {
    this.log(category, "info", message, data);
  }

  /**
   * Log warning message
   */
  warn(
    category: DebugCategory,
    message: string,
    data?: Record<string, unknown> | Error | unknown
  ): void {
    this.log(category, "warn", message, data);
  }

  /**
   * Log error message
   */
  error(
    category: DebugCategory,
    message: string,
    data?: Record<string, unknown> | Error | unknown
  ): void {
    this.log(category, "error", message, data);
  }

  /**
   * Log debug message
   */
  debug(
    category: DebugCategory,
    message: string,
    data?: Record<string, unknown> | Error | unknown
  ): void {
    this.log(category, "debug", message, data);
  }

  /**
   * Log success message
   */
  success(
    category: DebugCategory,
    message: string,
    data?: Record<string, unknown> | Error | unknown
  ): void {
    this.log(category, "success", message, data);
  }

  /**
   * Start a timer
   */
  time(label: string): void {
    this.timers.set(label, Date.now());
    this.debug("general", `Timer started: ${label}`);
  }

  /**
   * End a timer and log duration
   */
  timeEnd(label: string): void {
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

  /**
   * Log data as a table
   */
  table(data: Record<string, unknown>[], label?: string): void {
    if (label) {
      this.info("general", `Table: ${label}`);
    }
    console.table(data);
  }

  /**
   * Group related debug messages
   */
  group(label: string, callback: () => void): void {
    console.group(`🔍 ${label}`);
    callback();
    console.groupEnd();
  }

  /**
   * Log API request/response
   */
  api(
    method: string,
    url: string,
    status: number,
    data?: Record<string, unknown> | Error | unknown
  ): void {
    const level = status >= 400 ? "error" : status >= 300 ? "warn" : "success";
    this.log("api", level, `${method} ${url}`, { status, data });
  }

  /**
   * Log realtime events
   */
  realtime(
    event: string,
    channel: string,
    data?: Record<string, unknown> | Error | unknown
  ): void {
    this.debug("realtime", `Event: ${event}`, { channel, data });
  }

  /**
   * Log authentication events
   */
  auth(event: string, data?: Record<string, unknown> | Error | unknown): void {
    this.info("auth", `Auth Event: ${event}`, data);
  }

  /**
   * Log database operations
   */
  database(
    operation: string,
    table: string,
    data?: Record<string, unknown> | Error | unknown
  ): void {
    this.debug("database", `DB ${operation}`, { table, data });
  }
}

// Create singleton instance
const debug = new DebugManager();

// Export for use in other modules
export { debug, DebugManager };
export type { DebugLevel, DebugCategory, DebugConfig };
