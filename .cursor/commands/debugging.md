# Debugging Commands

## 1. Search and Find Root Problems

```bash
import { debug } from '@/lib/debug';
debug.getConfig();
debug.enableCategory('realtime');
debug.disableCategory('ui');
```

## 2. Make Ordered List of Debugging and Fixing

```typescript
debug.group("Authentication Flow Debug", () => {
  debug.info("auth", "Starting login process");
  debug.debug("auth", "Validating credentials");
  debug.success("auth", "Login successful");
});
```

## 3. Ideas to Do Correctly

- Use appropriate categories
- Include relevant data
- Choose appropriate log levels
- Performance considerations
- Error logging

## 4. Test Code to Verify It Works Correctly

```bash
npm run dev
node scripts/test-debug-utility.js
```

## 5. Monitor Logs During Testing

```typescript
debug.time("Database Query");
const result = await prisma.items.findMany();
debug.timeEnd("Database Query");

debug.table(auctions, "Active Auctions");

debug.realtime("subscription", "auction:123", { event: "bid_placed" });
debug.api("GET", "/api/items", 200, { count: 25 });
```

## Quick Commands

```bash
npm run dev
node scripts/test-debug-utility.js
node scripts/migrate-console-logs.js
```

## Debug Categories

- auth, api, database, realtime, payment, email, ui, general

## Debug Levels

- info, warn, error, debug, success

Fix all syntax errors
