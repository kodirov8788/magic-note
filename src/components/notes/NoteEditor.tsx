"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";
import { debug } from "@/lib/debug";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LineCopyButton from "./LineCopyButton";
import { Database } from "@/types/database";

type Note = Database["public"]["Tables"]["notes"]["Row"];

interface NoteEditorProps {
  note: Note;
}

export default function NoteEditor({ note }: NoteEditorProps) {
  const [title, setTitle] = useState<string>(note.title);
  const [content, setContent] = useState<string>(note.content);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setHasChanges(false);
  }, [note]);

  useEffect(() => {
    setHasChanges(title !== note.title || content !== note.content);
  }, [title, content, note.title, note.content]);

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("notes")
        .update({
          title: title.trim(),
          content: content,
        })
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
      }
    } catch (error) {
      toast.error("Failed to save note");
      debug.error("database", "NoteEditor: Exception saving note", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Note content copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy content");
      debug.error("ui", "NoteEditor: Error copying content", error);
    }
  };

  const handleCopySelected = async () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selectedText = textarea.value.substring(
      textarea.selectionStart,
      textarea.selectionEnd
    );

    if (!selectedText) {
      toast.error("No text selected");
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedText);
      toast.success("Selected text copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy selected text");
      debug.error("ui", "NoteEditor: Error copying selected text", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      if (e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold border-none shadow-none p-0 focus-visible:ring-0"
            placeholder="Untitled Note"
          />
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAll}
              disabled={!content.trim()}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySelected}
              disabled={!content.trim()}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
            >
              {isPreview ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </>
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
        {hasChanges && (
          <div className="text-sm text-amber-600">You have unsaved changes</div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {isPreview ? (
          <div className="h-full overflow-y-auto p-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">
                  {title || "Untitled Note"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content || "*No content yet*"}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full p-6">
            <div className="relative h-full">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Start writing your note... (Markdown supported)"
                className="h-full resize-none border-none shadow-none focus-visible:ring-0 text-sm font-mono"
              />
              <div className="absolute left-0 top-0 w-full h-full pointer-events-none">
                {content.split("\n").map((line, index) => (
                  <LineCopyButton
                    key={index}
                    content={line}
                    lineNumber={index + 1}
                    className="h-5 w-full"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
