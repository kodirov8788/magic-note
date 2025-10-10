"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { debug } from "@/lib/debug";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, FileText, Calendar } from "lucide-react";
import NoteDialog from "./NoteDialog";
import { Database } from "@/types/database";
import { SkeletonNoteCard } from "@/components/ui/skeleton";

type Note = Database["public"]["Tables"]["notes"]["Row"];

interface NotesListProps {
  folderId: string;
}

export default function NotesList({ folderId }: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showNoteDialog, setShowNoteDialog] = useState<boolean>(false);
  const router = useRouter();
  const supabase = createClient();

  const fetchNotes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("folder_id", folderId)
        .order("updated_at", { ascending: false });

      if (error) {
        debug.error("database", "NotesList: Error fetching notes", error);
      } else {
        debug.success("database", "NotesList: Notes fetched successfully", {
          count: data?.length || 0,
        });
        setNotes(data || []);
      }
    } catch (error) {
      debug.error("database", "NotesList: Exception fetching notes", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, folderId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleNoteCreated = () => {
    fetchNotes();
    setShowNoteDialog(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex justify-between items-center mb-4 lg:mb-6">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
          Notes
        </h2>
        <Button size="md" onClick={() => setShowNoteDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonNoteCard />
          <SkeletonNoteCard />
          <SkeletonNoteCard />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No notes yet
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first note
          </p>
          <Button size="md" onClick={() => setShowNoteDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Card
              key={note.id}
              className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => router.push(`/dashboard/notes/${note.id}`)}
              role="button"
              tabIndex={0}
              aria-label={`Open note: ${note.title}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/dashboard/notes/${note.id}`);
                }
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">
                  {note.title}
                </CardTitle>
                <CardDescription className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(note.updated_at)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {note.content || "No content"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NoteDialog
        open={showNoteDialog}
        onOpenChange={setShowNoteDialog}
        onNoteCreated={handleNoteCreated}
        folderId={folderId}
      />
    </div>
  );
}
