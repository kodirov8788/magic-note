# Development Workflow Commands

## Type Checking

```bash
# Check TypeScript types without emitting files
tsc --noEmit

# Watch mode for continuous type checking
tsc --noEmit --watch
```

## Development Server

```bash
# Start development server
npm run dev

# Start with specific port
npm run dev -- -p 3001
```

## Database Operations

```bash
# Generate Supabase types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

# Start local Supabase (if using local development)
npx supabase start

# Stop local Supabase
npx supabase stop

# Reset local database
npx supabase db reset
```

## Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint -- --fix

# Format code with Prettier
npx prettier --write .

# Check formatting
npx prettier --check .
```

## Build and Deployment

```bash
# Build for production
npm run build

# Start production server
npm start

# Analyze bundle size
npm run build && npx @next/bundle-analyzer
```

## Testing Commands

```bash
# Run type checking
tsc --noEmit

# Run linting
npm run lint

# Build and test
npm run build
```

## Supabase CLI Commands

```bash
# Login to Supabase
npx supabase login

# Link to project
npx supabase link --project-ref YOUR_PROJECT_REF

# Pull database schema
npx supabase db pull

# Push migrations
npx supabase db push

# Generate types
npx supabase gen types typescript --local > src/types/database.ts
```

## Git Workflow

```bash
# Check status
git status

# Add changes
git add .

# Commit with message
git commit -m "feat: add new feature"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main
```

## Environment Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

## Component Development

```bash
# Add new Shadcn component
npx shadcn@latest add [component-name]

# List available components
npx shadcn@latest add
```

## Debugging

```bash
# Run with debug logs
DEBUG=* npm run dev

# Check Supabase logs
npx supabase logs

# Check application logs
tail -f logs/app.log
```

## Performance Monitoring

```bash
# Analyze bundle
npm run build && npx @next/bundle-analyzer

# Check lighthouse score
npx lighthouse http://localhost:3000

# Monitor performance
npx clinic doctor -- node server.js
```

## Security Checks

```bash
# Audit dependencies
npm audit

# Fix security issues
npm audit fix

# Check for vulnerabilities
npx audit-ci
```

## Database Backup

```bash
# Backup database
npx supabase db dump --data-only > backup.sql

# Restore database
npx supabase db reset --db-url postgresql://...
```

## Common Issues and Solutions

### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

### Build Issues

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Supabase Connection Issues

```bash
# Check project status
npx supabase status

# Refresh project link
npx supabase link --project-ref YOUR_PROJECT_REF
```

### Environment Variable Issues

```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# Restart development server
npm run dev
```
