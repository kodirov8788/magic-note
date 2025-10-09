import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to access your notes.</div>;
  }

  // Get folders count
  const { count: foldersCount } = await supabase
    .from("folders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get notes count
  const { count: notesCount } = await supabase
    .from("notes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600">Manage your notes and folders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Folders</CardTitle>
            <CardDescription>Organize your notes into folders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {foldersCount || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">Total folders created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>All your notes across all folders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {notesCount || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">Total notes created</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Quick tips to get the most out of your notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Create your first folder</p>
                  <p className="text-sm text-gray-600">
                    Click &quot;New Folder&quot; in the sidebar to organize your notes
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Start writing notes</p>
                  <p className="text-sm text-gray-600">
                    Select a folder and create your first note with markdown
                    support
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Use copy features</p>
                  <p className="text-sm text-gray-600">
                    Copy individual lines, selected text, or entire notes with
                    custom buttons
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
