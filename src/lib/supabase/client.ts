import { createBrowserClient } from "@supabase/ssr";
import { debug } from "@/lib/debug";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function createClient() {
  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseEnv();

  debug.debug("auth", "Creating Supabase client", {
    url: supabaseUrl ? "Set" : "Not set",
    key: supabaseAnonKey ? "Set" : "Not set",
  });

  const client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  debug.success("auth", "Supabase client created successfully");
  return client;
}
