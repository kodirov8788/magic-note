#!/usr/bin/env tsx

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error(
    "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

// Create Supabase client with service role for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createSampleUser() {
  try {
    console.log("🚀 Creating sample user...");

    // Create test user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: "test@example.com",
        password: "testpassword123",
        email_confirm: true,
      });

    if (authError) {
      console.error("❌ Failed to create user:", authError.message);
      return;
    }

    const user = authData.user;
    console.log("✅ User created:", user.email);

    // Create sample folders
    const folders = [
      { name: "Work Notes" },
      { name: "Personal" },
      { name: "Ideas" },
      { name: "Projects" },
    ];

    console.log("📁 Creating sample folders...");
    const { data: foldersData, error: foldersError } = await supabase
      .from("folders")
      .insert(
        folders.map((folder) => ({
          name: folder.name,
          user_id: user.id,
        }))
      )
      .select();

    if (foldersError) {
      console.error("❌ Failed to create folders:", foldersError.message);
      return;
    }

    console.log(`✅ Created ${foldersData.length} folders`);

    // Create sample notes
    const notes = [
      {
        title: "Welcome to Magic Note",
        content: `# Welcome to Magic Note!

This is your first note. You can:

- **Create folders** to organize your notes
- **Write in markdown** for rich formatting
- **Copy individual lines** by hovering over them
- **Copy selected text** or the entire note
- **Auto-save** your changes

## Features

1. **Markdown Support**: Use markdown syntax for formatting
2. **Line-by-line Copy**: Hover over any line to copy it
3. **Folder Organization**: Keep your notes organized
4. **Auto-save**: Your changes are saved automatically

Happy note-taking! 🎉`,
        folder_id: foldersData[0].id,
      },
      {
        title: "Meeting Notes Template",
        content: `# Meeting Notes - [Date]

## Attendees
- [ ] Person 1
- [ ] Person 2
- [ ] Person 3

## Agenda
1. Topic 1
2. Topic 2
3. Topic 3

## Discussion Points
- Point 1
- Point 2
- Point 3

## Action Items
- [ ] Task 1 - Assignee
- [ ] Task 2 - Assignee
- [ ] Task 3 - Assignee

## Next Steps
- Follow up on action items
- Schedule next meeting`,
        folder_id: foldersData[0].id,
      },
      {
        title: "Project Ideas",
        content: `# Project Ideas

## Web Applications
- Note-taking app ✅ (Done!)
- Task management tool
- Recipe organizer
- Budget tracker

## Mobile Apps
- Habit tracker
- Expense manager
- Learning journal
- Fitness tracker

## Tools & Utilities
- Password manager
- File organizer
- Code snippet library
- API documentation tool

## Features to Consider
- Real-time collaboration
- Offline support
- Mobile app
- Advanced search
- Tags and categories`,
        folder_id: foldersData[2].id,
      },
      {
        title: "Daily Journal",
        content: `# Daily Journal - ${new Date().toLocaleDateString()}

## Today's Goals
- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3

## Accomplishments
- 

## Challenges
- 

## Learnings
- 

## Tomorrow's Focus
- 

## Gratitude
- 

## Notes
- `,
        folder_id: foldersData[1].id,
      },
      {
        title: "Code Snippets",
        content: `# Useful Code Snippets

## React Hooks

### Custom Hook for API Calls
\`\`\`typescript
function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}
\`\`\`

### Debounced Input Hook
\`\`\`typescript
function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
\`\`\`

## Utility Functions

### Format Date
\`\`\`typescript
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}
\`\`\``,
        folder_id: foldersData[3].id,
      },
    ];

    console.log("📝 Creating sample notes...");
    const { data: notesData, error: notesError } = await supabase
      .from("notes")
      .insert(
        notes.map((note) => ({
          title: note.title,
          content: note.content,
          folder_id: note.folder_id,
          user_id: user.id,
        }))
      )
      .select();

    if (notesError) {
      console.error("❌ Failed to create notes:", notesError.message);
      return;
    }

    console.log(`✅ Created ${notesData.length} notes`);

    // Summary
    console.log("\n🎉 Sample user setup complete!");
    console.log("📧 Email: test@example.com");
    console.log("🔑 Password: testpassword123");
    console.log(`📁 Folders: ${foldersData.length}`);
    console.log(`📝 Notes: ${notesData.length}`);
    console.log("\nYou can now log in and test the application!");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

async function main() {
  await createSampleUser();
}

main();
