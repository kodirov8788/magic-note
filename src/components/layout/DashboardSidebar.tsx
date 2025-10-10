"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { debug } from "@/lib/debug";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Folder,
  LogOut,
  Settings,
  X,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
  ChevronRight,
  ChevronDown,
  FilePlus,
} from "lucide-react";
import FolderDialog from "@/components/folders/FolderDialog";
import SettingsDialog from "@/components/settings/SettingsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Database } from "@/types/database";
import type { User } from "@supabase/supabase-js";
import { SkeletonSidebarItem } from "@/components/ui/skeleton";

type Folder = Database["public"]["Tables"]["folders"]["Row"];
type Note = Database["public"]["Tables"]["notes"]["Row"];

type FolderWithNotes = Folder & {
  notes: Note[];
};

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  refreshTrigger?: number;
}

export default function DashboardSidebar({
  isOpen,
  onToggle,
  refreshTrigger,
}: DashboardSidebarProps) {
  const [folders, setFolders] = useState<FolderWithNotes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFolderDialog, setShowFolderDialog] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentNoteFolderId, setCurrentNoteFolderId] = useState<string | null>(
    null
  );
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
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

  const fetchCurrentNoteFolder = useCallback(
    async (noteId: string) => {
      try {
        const { data: note, error } = await supabase
          .from("notes")
          .select("folder_id")
          .eq("id", noteId)
          .single();

        if (error) {
          debug.error(
            "database",
            "DashboardSidebar: Error fetching note folder",
            error
          );
          return;
        }

        setCurrentNoteFolderId(note?.folder_id || null);
      } catch (error) {
        debug.error(
          "database",
          "DashboardSidebar: Exception fetching note folder",
          error
        );
      }
    },
    [supabase]
  );

  // Check if we're on a note page and fetch the note's folder
  useEffect(() => {
    const noteIdMatch = pathname.match(/^\/dashboard\/notes\/([^\/]+)$/);
    if (noteIdMatch) {
      const noteId = noteIdMatch[1];
      fetchCurrentNoteFolder(noteId);
    } else {
      setCurrentNoteFolderId(null);
    }
  }, [pathname, fetchCurrentNoteFolder]);

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
        .select(
          `
          *,
          notes (
            id,
            title,
            created_at,
            updated_at
          )
        `
        )
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
          "DashboardSidebar: Folders with notes fetched successfully",
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

  // Refresh folders when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && user) {
      fetchFolders();
    }
  }, [refreshTrigger, user, fetchFolders]);

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
    setEditingFolder(null);
  };

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setShowFolderDialog(true);
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this folder? All notes in this folder will also be deleted."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", folderId);

      if (error) {
        debug.error(
          "database",
          "DashboardSidebar: Error deleting folder",
          error
        );
      } else {
        debug.success(
          "database",
          "DashboardSidebar: Folder deleted successfully"
        );
        fetchFolders();
      }
    } catch (error) {
      debug.error(
        "database",
        "DashboardSidebar: Exception deleting folder",
        error
      );
    }
  };

  const handleEditNote = (note: Note) => {
    // Navigate to note editor for editing
    router.push(`/dashboard/notes/${note.id}`);
    // Auto-close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      const { error } = await supabase.from("notes").delete().eq("id", noteId);

      if (error) {
        debug.error("database", "DashboardSidebar: Error deleting note", error);
        toast.error("Failed to delete note");
      } else {
        debug.success(
          "database",
          "DashboardSidebar: Note deleted successfully"
        );
        fetchFolders();
      }
    } catch (error) {
      debug.error(
        "database",
        "DashboardSidebar: Exception deleting note",
        error
      );
      toast.error("Failed to delete note");
    }
  };

  const handleCreateNoteInFolder = async (folderId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create a note");
        return;
      }

      // Get existing notes in the folder to determine the next title
      const { data: existingNotes, error: fetchError } = await supabase
        .from("notes")
        .select("title")
        .eq("folder_id", folderId)
        .eq("user_id", user.id);

      if (fetchError) {
        debug.error(
          "database",
          "DashboardSidebar: Error fetching existing notes",
          fetchError
        );
        toast.error("Failed to create note");
        return;
      }

      // Generate unique title
      let title = "Untitled Note";
      const existingTitles = existingNotes?.map((note) => note.title) || [];

      if (existingTitles.includes(title)) {
        let counter = 2;
        while (existingTitles.includes(`${title} ${counter}`)) {
          counter++;
        }
        title = `${title} ${counter}`;
      }

      const { data: note, error } = await supabase
        .from("notes")
        .insert({
          title: title,
          content: "",
          folder_id: folderId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        debug.error("database", "DashboardSidebar: Error creating note", error);
        toast.error("Failed to create note");
      } else {
        debug.success(
          "database",
          "DashboardSidebar: Note created successfully"
        );
        fetchFolders();
        router.push(`/dashboard/notes/${note.id}`);
        // Auto-close sidebar on mobile after navigation
        if (window.innerWidth < 1024) {
          onToggle();
        }
      }
    } catch (error) {
      debug.error(
        "database",
        "DashboardSidebar: Exception creating note",
        error
      );
      toast.error("Failed to create note");
    }
  };

  const isActive = (folderId: string) => {
    // Check if we're on a folder page
    if (pathname === `/dashboard/folders/${folderId}`) {
      return true;
    }

    // Check if we're on a note page and this folder contains the note
    if (
      pathname.startsWith("/dashboard/notes/") &&
      currentNoteFolderId === folderId
    ) {
      return true;
    }

    return false;
  };

  const isNoteActive = (noteId: string) => {
    return pathname === `/dashboard/notes/${noteId}`;
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // Auto-expand folder containing current note
  useEffect(() => {
    if (currentNoteFolderId) {
      setExpandedFolders((prev) => new Set([...prev, currentNoteFolderId]));
    }
  }, [currentNoteFolderId]);

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar - fixed position */}
      <div
        className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 
        flex flex-col z-50 transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Header with close button */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">MagicNote</h1>
          <Button
            variant="ghost"
            size="md"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Folders list */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowFolderDialog(true)}
              className="w-full justify-start"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Folder
            </Button>

            <Separator className="my-4" />

            {loading ? (
              <div className="space-y-2">
                <SkeletonSidebarItem />
                <SkeletonSidebarItem />
                <SkeletonSidebarItem />
              </div>
            ) : folders.length === 0 ? (
              <div className="text-sm text-gray-500">No folders yet</div>
            ) : (
              <div className="space-y-1">
                {folders.map((folder) => (
                  <div key={folder.id} className="space-y-1">
                    {/* Folder */}
                    <div className="flex items-center group">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFolder(folder.id)}
                        className="h-6 w-6 p-0 hover:bg-gray-100"
                      >
                        {expandedFolders.has(folder.id) ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        variant={isActive(folder.id) ? "default" : "ghost"}
                        size="md"
                        onClick={() => {
                          router.push(`/dashboard/folders/${folder.id}`);
                          // Auto-close sidebar on mobile after navigation
                          if (window.innerWidth < 1024) {
                            onToggle();
                          }
                        }}
                        className="flex-1 justify-start ml-1"
                      >
                        <Folder className="w-4 h-4 mr-2" />
                        <span className="truncate">{folder.name}</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          ({folder.notes?.length || 0})
                        </span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-100 transition-all duration-200 h-8 w-8 p-0 hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleCreateNoteInFolder(folder.id)}
                            className="cursor-pointer"
                          >
                            <FilePlus className="w-4 h-4 mr-2" />
                            Create Note
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditFolder(folder)}
                            className="cursor-pointer"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Folder
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteFolder(folder.id)}
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Folder
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Notes */}
                    {expandedFolders.has(folder.id) &&
                      folder.notes &&
                      folder.notes.length > 0 && (
                        <div className="ml-10 space-y-1">
                          {folder.notes.map((note) => (
                            <div
                              key={note.id}
                              className="flex items-center group"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  router.push(`/dashboard/notes/${note.id}`);
                                  // Auto-close sidebar on mobile after navigation
                                  if (window.innerWidth < 1024) {
                                    onToggle();
                                  }
                                }}
                                className={`flex-1 justify-start text-sm ${
                                  isNoteActive(note.id)
                                    ? "border-l-2 border-[#6086f7] bg-transparent text-[#6086f7] hover:bg-gray-100"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                <FileText className="w-3 h-3 mr-2" />
                                <span className="truncate">{note.title}</span>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`transition-all duration-200 h-6 w-6 p-0 hover:bg-gray-100 text-gray-500 hover:text-gray-700 ${
                                      isNoteActive(note.id)
                                        ? "opacity-100"
                                        : "opacity-0 group-hover:opacity-100"
                                    }`}
                                  >
                                    <MoreVertical className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-40"
                                >
                                  <DropdownMenuItem
                                    onClick={() => handleEditNote(note)}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="w-3 h-3 mr-2" />
                                    Edit Note
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="text-red-600 focus:text-red-600 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    Delete Note
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer with Settings and Sign Out */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setShowSettings(true)}
            className="w-full justify-start"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <FolderDialog
        open={showFolderDialog}
        onOpenChange={(open) => {
          setShowFolderDialog(open);
          if (!open) {
            setEditingFolder(null);
          }
        }}
        onFolderCreated={handleFolderCreated}
        editingFolder={editingFolder}
      />

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </>
  );
}
