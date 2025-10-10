import { ContentItem } from "./index";

export interface Database {
  public: {
    Tables: {
      folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          folder_id: string | null;
          user_id: string;
          title: string;
          content: string;
          content_items?: ContentItem[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          folder_id?: string | null;
          user_id: string;
          title: string;
          content: string;
          content_items?: ContentItem[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          folder_id?: string | null;
          user_id?: string;
          title?: string;
          content?: string;
          content_items?: ContentItem[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
