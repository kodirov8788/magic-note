"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { debug } from "@/lib/debug";
import { validateFolderName } from "@/lib/validation";

interface FolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFolderCreated: () => void;
  editingFolder?: { id: string; name: string } | null;
}

export default function FolderDialog({
  open,
  onOpenChange,
  onFolderCreated,
  editingFolder,
}: FolderDialogProps) {
  const [name, setName] = useState<string>(editingFolder?.name || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate folder name
    const nameValidation = validateFolderName(name);
    if (!nameValidation.isValid) {
      setError(nameValidation.error!);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to manage folders");
        return;
      }

      if (editingFolder) {
        // Update existing folder
        const { error } = await supabase
          .from("folders")
          .update({ name: name.trim() })
          .eq("id", editingFolder.id)
          .eq("user_id", user.id);

        if (error) {
          setError(error.message);
        } else {
          setName("");
          onFolderCreated();
        }
      } else {
        // Create new folder
        const { error } = await supabase.from("folders").insert({
          name: name.trim(),
          user_id: user.id,
        });

        if (error) {
          setError(error.message);
        } else {
          setName("");
          onFolderCreated();
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName("");
      setError("");
    } else {
      setName(editingFolder?.name || "");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingFolder ? "Edit Folder" : "Create New Folder"}
          </DialogTitle>
          <DialogDescription>
            {editingFolder
              ? "Update the name of your folder."
              : "Enter a name for your new folder."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              placeholder="Folder name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading
                ? editingFolder
                  ? "Updating..."
                  : "Creating..."
                : editingFolder
                ? "Update Folder"
                : "Create Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
