import { createBrowserClient } from "@supabase/ssr";
import { debug } from "@/lib/debug";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  debug.debug("auth", "Creating Supabase client", {
    url: supabaseUrl ? "Set" : "Not set",
    key: supabaseAnonKey ? "Set" : "Not set",
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    debug.error("auth", "Missing Supabase environment variables");
    throw new Error(
      "Missing Supabase environment variables. Please check your .env.local file."
    );
  }

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
