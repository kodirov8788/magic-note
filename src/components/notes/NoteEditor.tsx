"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Save, Table, Type, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { debug } from "@/lib/debug";
import MixedContentEditor from "./MixedContentEditor";
import { Database } from "@/types/database";
import { ContentItem } from "@/types";
import { useSettings } from "@/lib/store/settings";
import { validateNoteTitle, validateContent } from "@/lib/validation";

type Note = Database["public"]["Tables"]["notes"]["Row"];

interface NoteEditorProps {
  note: Note;
  onNoteSaved?: () => void;
}

export default function NoteEditor({ note, onNoteSaved }: NoteEditorProps) {
  const { autosave } = useSettings();

  const parseContentToItems = (content: string): ContentItem[] => {
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
  };

  const [title, setTitle] = useState<string>(note.title);
  const [contentItems, setContentItems] = useState<ContentItem[]>(() => {
    // Handle missing content_items column gracefully
    if (note.content_items) {
      return note.content_items;
    }

    // Fallback: parse existing content if content_items is missing
    if (note.content) {
      return parseContentToItems(note.content);
    }

    return [];
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const supabase = createClient();

  useEffect(() => {
    setTitle(note.title);
    if (note.content_items) {
      setContentItems(note.content_items);
    } else if (note.content) {
      setContentItems(parseContentToItems(note.content));
    } else {
      setContentItems([]);
    }
    setHasChanges(false);
  }, [note]);

  const serializeToText = (items: ContentItem[]): string => {
    return items
      .map((item) => {
        if (item.type === "table-row") {
          return `TABLE: ${item.key}: ${item.value}`;
        } else {
          return `TEXT: ${item.text}`;
        }
      })
      .join("\n");
  };

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    // Validate inputs
    const titleValidation = validateNoteTitle(title);
    if (!titleValidation.isValid) {
      toast.error(titleValidation.error!);
      return;
    }

    const contentText = serializeToText(contentItems);
    const contentValidation = validateContent(contentText);
    if (!contentValidation.isValid) {
      toast.error(contentValidation.error!);
      return;
    }

    setIsSaving(true);
    try {
      // Try to save with content_items first, fallback to content only if column doesn't exist
      const updateData: {
        title: string;
        content: string;
        content_items?: ContentItem[];
      } = {
        title: title.trim(),
        content: serializeToText(contentItems),
      };

      // Only include content_items if the column exists (avoid 400 error)
      try {
        updateData.content_items = contentItems;
      } catch {
        // Column doesn't exist, skip it
        console.log(
          "content_items column not available, saving to content only"
        );
      }

      const { error } = await supabase
        .from("notes")
        .update(updateData)
        .eq("id", note.id);

      if (error) {
        toast.error("Failed to save note");
        debug.error("database", "NoteEditor: Error saving note", error);
      } else {
        toast.success("Note saved successfully");
        debug.success("database", "NoteEditor: Note saved successfully", {
          noteId: note.id,
        });
        setHasChanges(false);
        setLastSaved(new Date());
        onNoteSaved?.();
        // Trigger sidebar refresh
        window.dispatchEvent(new CustomEvent("noteSaved"));
      }
    } catch (error) {
      toast.error("Failed to save note");
      debug.error("database", "NoteEditor: Exception saving note", error);
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, title, contentItems, note.id, supabase, onNoteSaved]);

  useEffect(() => {
    setHasChanges(
      title !== note.title ||
        JSON.stringify(contentItems) !==
          JSON.stringify(note.content_items || [])
    );
  }, [title, contentItems, note.title, note.content_items]);

  // Auto-save effect when autosave is enabled
  useEffect(() => {
    if (autosave && hasChanges) {
      const timer = setTimeout(() => {
        handleSave();
      }, 1000); // Debounce 1 second

      return () => clearTimeout(timer);
    }
  }, [autosave, hasChanges, handleSave]);

  const handleCopyAll = async () => {
    try {
      const textContent = serializeToText(contentItems);
      await navigator.clipboard.writeText(textContent);
      toast.success("Note content copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy content");
      debug.error("ui", "NoteEditor: Error copying content", error);
    }
  };

  const handleAddTableRow = () => {
    const newItem: ContentItem = {
      type: "table-row",
      id: `table-${Date.now()}`,
      key: "",
      value: "",
    };
    setContentItems([...contentItems, newItem]);
  };

  const handleAddTextField = () => {
    const newItem: ContentItem = {
      type: "text-field",
      id: `text-${Date.now()}`,
      text: "",
    };
    setContentItems([...contentItems, newItem]);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="py-8 lg:py-16 px-4 lg:px-6 border-b border-gray-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg sm:text-xl font-semibold border-none shadow-none p-0 focus-visible:ring-0 flex-1"
            placeholder="Untitled Note"
          />
          <div className="flex items-center gap-2">
            {/* Save Status Icon */}
            <div className="relative group">
              {hasChanges ? (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              ) : lastSaved ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Save className="w-5 h-5 text-gray-400" />
              )}
              <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {hasChanges
                  ? "Unsaved changes"
                  : lastSaved
                  ? `Saved ${lastSaved.toLocaleTimeString()}`
                  : "Saved"}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
                disabled={contentItems.length === 0}
                className="flex-shrink-0 px-2 sm:px-4"
              >
                <Copy className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Copy All</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTableRow}
                className="flex-shrink-0 px-2 sm:px-4"
              >
                <Table className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Table Row</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTextField}
                className="flex-shrink-0 px-2 sm:px-4"
              >
                <Type className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Text Field</span>
              </Button>
              {!autosave && (
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  size="sm"
                  className="flex-shrink-0 px-2 sm:px-4"
                >
                  <Save className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {isSaving ? "Saving..." : "Save"}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <MixedContentEditor
          contentItems={contentItems}
          onChange={(newContentItems: ContentItem[]) =>
            setContentItems(newContentItems)
          }
        />
      </div>
    </div>
  );
}
