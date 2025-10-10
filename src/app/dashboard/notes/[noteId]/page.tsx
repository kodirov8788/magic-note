import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NoteEditor from "@/components/notes/NoteEditor";

interface NotePageProps {
  params: Promise<{ noteId: string }>;
}

export default async function NotePage({ params }: NotePageProps) {
  const { noteId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get note details
  const { data: note, error: noteError } = await supabase
    .from("notes")
    .select("*")
    .eq("id", noteId)
    .eq("user_id", user.id)
    .single();

  if (noteError || !note) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{note.title}</h1>
          <p className="text-gray-600">Edit your note with markdown support</p>
        </div>
        <div className="flex-1 overflow-hidden">
          <NoteEditor note={note} />
        </div>
      </div>
    </div>
  );
}
