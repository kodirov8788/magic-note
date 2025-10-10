import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NotesList from "@/components/notes/NotesList";

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
        <div className="py-8 lg:py-16 px-6 border-b border-gray-200">
          <div className="text-center mb-8 lg:mb-16">
            <span className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-gray-600 mb-4 lg:mb-6">
              Folder
            </span>
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-light text-black mb-4 lg:mb-6">
              {folder.name}
            </h1>
            <p className="text-base lg:text-lg text-gray-600 max-w-3xl mx-auto">
              Manage your notes in this folder
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <NotesList folderId={params.folderId} />
        </div>
      </div>
    </div>
  );
}
