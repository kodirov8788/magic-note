# Magic Note App - Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DIRECT_DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres
```

## How to Get These Values

### 1. Supabase Project Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing project
3. Wait for the project to be fully provisioned

### 2. Get API Keys

1. Go to **Settings** → **API**
2. Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy the **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy the **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Get Database Connection String

1. Go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Select **URI** format
4. Copy the connection string → `DIRECT_DATABASE_URL`

## Database Migration

After setting up the environment variables, run the database migration:

```bash
npm run migrate
```

This will create:

- `folders` table with RLS policies
- `notes` table with RLS policies
- Proper indexes for performance
- Triggers for automatic `updated_at` timestamps

## Security Notes

- Never commit `.env.local` to version control
- The service role key has admin privileges - keep it secure
- RLS policies ensure users can only access their own data
- All database operations are validated server-side

## Next Steps

1. Set up environment variables
2. Run database migration
3. Start development server: `npm run dev`
4. Test authentication and CRUD operations
