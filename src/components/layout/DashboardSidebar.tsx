"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Folder, LogOut } from "lucide-react";
import FolderDialog from "@/components/folders/FolderDialog";
import { Database } from "@/types/database";

type Folder = Database["public"]["Tables"]["folders"]["Row"];

export default function DashboardSidebar() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const fetchFolders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching folders:", error);
      } else {
        setFolders(data || []);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const handleFolderCreated = () => {
    fetchFolders();
    setShowFolderDialog(false);
  };

  const isActive = (folderId: string) => {
    return pathname === `/dashboard/folders/${folderId}`;
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Notes</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFolderDialog(true)}
            className="w-full justify-start"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Folder
          </Button>

          <Separator className="my-4" />

          {loading ? (
            <div className="text-sm text-gray-500">Loading folders...</div>
          ) : folders.length === 0 ? (
            <div className="text-sm text-gray-500">No folders yet</div>
          ) : (
            <div className="space-y-1">
              {folders.map((folder) => (
                <Button
                  key={folder.id}
                  variant={isActive(folder.id) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => router.push(`/dashboard/folders/${folder.id}`)}
                  className="w-full justify-start"
                >
                  <Folder className="w-4 h-4 mr-2" />
                  {folder.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <FolderDialog
        open={showFolderDialog}
        onOpenChange={setShowFolderDialog}
        onFolderCreated={handleFolderCreated}
      />
    </div>
  );
}
