"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { debug } from "@/lib/debug";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Folder, LogOut } from "lucide-react";
import FolderDialog from "@/components/folders/FolderDialog";
import { Database } from "@/types/database";
import type { User } from "@supabase/supabase-js";

type Folder = Database["public"]["Tables"]["folders"]["Row"];

export default function DashboardSidebar() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFolderDialog, setShowFolderDialog] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // Get user first
  useEffect(() => {
    const getUser = async () => {
      debug.debug("auth", "DashboardSidebar: Getting user");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      debug.info("auth", "DashboardSidebar: User retrieved", {
        user: user ? user.email : "No user",
      });
    };
    getUser();
  }, [supabase.auth]);

  const fetchFolders = useCallback(async () => {
    if (!user) {
      debug.debug(
        "database",
        "DashboardSidebar: No user, skipping folder fetch"
      );
      return;
    }

    debug.time("Fetch Folders");
    debug.debug("database", "DashboardSidebar: Fetching folders", {
      userId: user.id,
    });

    try {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        debug.error(
          "database",
          "DashboardSidebar: Error fetching folders",
          error
        );
      } else {
        debug.success(
          "database",
          "DashboardSidebar: Folders fetched successfully",
          {
            count: data?.length || 0,
          }
        );
        setFolders(data || []);
      }
    } catch (error) {
      debug.error(
        "database",
        "DashboardSidebar: Exception fetching folders",
        error
      );
    } finally {
      debug.timeEnd("Fetch Folders");
      setLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [fetchFolders, user]);

  const handleLogout = async () => {
    debug.info("auth", "DashboardSidebar: User logout initiated");
    await supabase.auth.signOut();
    debug.success("auth", "DashboardSidebar: User logged out successfully");
    router.push("/auth/login");
    router.refresh();
  };

  const handleFolderCreated = () => {
    debug.info("database", "DashboardSidebar: Folder created, refreshing list");
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
