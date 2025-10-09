import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NotesList from "@/components/notes/NotesList";
import { Database } from "@/types/database";

type Folder = Database["public"]["Tables"]["folders"]["Row"];

interface FolderPageProps {
  params: { folderId: string };
}

export default async function FolderPage({ params }: FolderPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get folder details
  const { data: folder, error: folderError } = await supabase
    .from("folders")
    .select("*")
    .eq("id", params.folderId)
    .eq("user_id", user.id)
    .single();

  if (folderError || !folder) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{folder.name}</h1>
          <p className="text-gray-600">Manage your notes in this folder</p>
        </div>
        <div className="flex-1 overflow-hidden">
          <NotesList folderId={params.folderId} />
        </div>
      </div>
    </div>
  );
}
