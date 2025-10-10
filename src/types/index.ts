/**
 * Comprehensive type definitions for the Notes App
 * Ensures type safety across all components and utilities
 */

import type { User } from "@supabase/supabase-js";
import type { Database } from "./database";

// Re-export database types for convenience
export type { Database };

// User types
export type AppUser = User;
export type UserProfile = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
};

// Folder types
export type Folder = Database["public"]["Tables"]["folders"]["Row"];
export type FolderInsert = Database["public"]["Tables"]["folders"]["Insert"];
export type FolderUpdate = Database["public"]["Tables"]["folders"]["Update"];

// Content item types
export type ContentItem =
  | { type: "table-row"; id: string; key: string; value: string }
  | { type: "text-field"; id: string; text: string };

// Note types
export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type NoteInsert = Database["public"]["Tables"]["notes"]["Insert"];
export type NoteUpdate = Database["public"]["Tables"]["notes"]["Update"];

// API Response types
export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  message?: string;
};

export type ApiError = {
  error: string;
  message?: string;
  code?: string;
};

// Form state types
export type FormState = {
  loading: boolean;
  error: string;
  success?: boolean;
};

export type LoginFormData = {
  email: string;
  password: string;
};

export type SignupFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type FolderFormData = {
  name: string;
};

export type NoteFormData = {
  title: string;
  content: string;
  folderId: string;
};

// Component prop types
export type DashboardContentProps = {
  user: AppUser;
};

export type FolderPageProps = {
  params: Promise<{ folderId: string }>;
};

export type NotePageProps = {
  params: Promise<{ noteId: string }>;
};

export type FolderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFolderCreated: () => void;
};

export type NoteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteCreated: () => void;
  folderId: string;
};

export type NoteEditorProps = {
  note: Note;
};

export type NotesListProps = {
  folderId: string;
};

export type LineCopyButtonProps = {
  content: string;
  lineNumber: number;
  className?: string;
};

// Debug utility types
export type DebugData = {
  category: DebugCategory;
  level: DebugLevel;
  message: string;
  data?: Record<string, unknown>;
  timestamp: number;
};

export type DebugCategory =
  | "auth"
  | "api"
  | "database"
  | "realtime"
  | "payment"
  | "email"
  | "ui"
  | "general";

export type DebugLevel = "info" | "warn" | "error" | "debug" | "success";

// Database operation types
export type DatabaseOperation = "SELECT" | "INSERT" | "UPDATE" | "DELETE";

export type DatabaseTable = "folders" | "notes" | "users";

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Error types
export type AppError = {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
};

// Navigation types
export type NavigationItem = {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  active?: boolean;
};

// Toast types
export type ToastType = "success" | "error" | "warning" | "info";

export type ToastMessage = {
  type: ToastType;
  message: string;
  duration?: number;
};
