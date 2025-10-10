import { Pool } from "pg";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL,
});

export async function runMigration() {
  const client = await pool.connect();

  try {
    // Create folders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS folders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create notes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL DEFAULT 'Untitled Note',
        content TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Enable Row Level Security
    await client.query(`ALTER TABLE folders ENABLE ROW LEVEL SECURITY;`);
    await client.query(`ALTER TABLE notes ENABLE ROW LEVEL SECURITY;`);

    // RLS Policies for folders
    await client.query(`
      CREATE POLICY "Users can view their own folders" ON folders
        FOR SELECT USING (auth.uid() = user_id);
    `);

    await client.query(`
      CREATE POLICY "Users can insert their own folders" ON folders
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    `);

    await client.query(`
      CREATE POLICY "Users can update their own folders" ON folders
        FOR UPDATE USING (auth.uid() = user_id);
    `);

    await client.query(`
      CREATE POLICY "Users can delete their own folders" ON folders
        FOR DELETE USING (auth.uid() = user_id);
    `);

    // RLS Policies for notes
    await client.query(`
      CREATE POLICY "Users can view their own notes" ON notes
        FOR SELECT USING (auth.uid() = user_id);
    `);

    await client.query(`
      CREATE POLICY "Users can insert their own notes" ON notes
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    `);

    await client.query(`
      CREATE POLICY "Users can update their own notes" ON notes
        FOR UPDATE USING (auth.uid() = user_id);
    `);

    await client.query(`
      CREATE POLICY "Users can delete their own notes" ON notes
        FOR DELETE USING (auth.uid() = user_id);
    `);

    // Create function to update updated_at timestamp
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for updated_at
    await client.query(`
      CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create indexes for better performance
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_folders_created_at ON folders(created_at DESC);`
    );

    console.log("✅ Database migration completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

export async function closeConnection() {
  await pool.end();
}
