import { PrismaClient, Prisma } from "@prisma/client";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

interface ContentItem {
  type: "table-row" | "text-field";
  id: string;
  key?: string;
  value?: string;
  text?: string;
}

async function migrateContentWithPrisma() {
  console.log("Starting migration of notes to JSON structure using Prisma...");

  const prisma = new PrismaClient();

  try {
    // Get all notes
    const allNotes = await prisma.note.findMany({
      select: {
        id: true,
        content: true,
        title: true,
        contentItems: true,
      },
    });

    // Filter notes that need migration
    const notes = allNotes.filter(
      (note) =>
        !note.contentItems ||
        (Array.isArray(note.contentItems) && note.contentItems.length === 0)
    );

    console.log(`Found ${notes.length} notes to migrate`);

    if (notes.length === 0) {
      console.log("No notes need migration");
      return;
    }

    let migratedCount = 0;

    for (const note of notes) {
      try {
        const contentItems = parseContentToItems(note.content);

        await prisma.note.update({
          where: { id: note.id },
          data: {
            contentItems: contentItems as unknown as Prisma.InputJsonValue,
            // Keep content field for backward compatibility
          },
        });

        migratedCount++;
        console.log(
          `✅ Migrated note: "${note.title}" (${contentItems.length} items)`
        );
      } catch (error) {
        console.error(`❌ Failed to migrate note "${note.title}":`, error);
      }
    }

    console.log(
      `\n🎉 Migration completed! Migrated ${migratedCount} out of ${notes.length} notes`
    );
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

function parseContentToItems(content: string): ContentItem[] {
  if (!content.trim()) {
    return [];
  }

  const lines = content.split("\n").filter((line) => line.trim());
  const items: ContentItem[] = [];

  lines.forEach((line, index) => {
    if (line.startsWith("TABLE:")) {
      const tableContent = line.substring(6).trim();
      const colonIndex = tableContent.indexOf(":");

      if (colonIndex > 0) {
        items.push({
          type: "table-row",
          id: `table-${Date.now()}-${index}`,
          key: tableContent.substring(0, colonIndex).trim(),
          value: tableContent.substring(colonIndex + 1).trim(),
        });
      } else {
        items.push({
          type: "table-row",
          id: `table-${Date.now()}-${index}`,
          key: tableContent,
          value: "",
        });
      }
    } else if (line.startsWith("TEXT:")) {
      items.push({
        type: "text-field",
        id: `text-${Date.now()}-${index}`,
        text: line.substring(5).trim(),
      });
    } else {
      // Legacy format - treat as text field
      items.push({
        type: "text-field",
        id: `text-${Date.now()}-${index}`,
        text: line.trim(),
      });
    }
  });

  return items;
}

migrateContentWithPrisma()
  .then(() => {
    console.log("Migration script completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });
