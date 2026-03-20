const PLACEHOLDER_SUPABASE_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_SUPABASE_ANON_KEY = "placeholder-anon-key";

const isBuildPhase = () => process.env.NEXT_PHASE === "phase-production-build";

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && anonKey) {
    return {
      url,
      anonKey,
      isPlaceholder: false,
    };
  }

  if (process.env.NODE_ENV === "test" || isBuildPhase()) {
    return {
      url: url || PLACEHOLDER_SUPABASE_URL,
      anonKey: anonKey || PLACEHOLDER_SUPABASE_ANON_KEY,
      isPlaceholder: true,
    };
  }

  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
}
