import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables for public client
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase configuration is incomplete. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.");
}

// Export single supabase client instance (public, client-side safe)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Export supabaseAdmin client (server-side only)
export const supabaseAdmin = typeof window === "undefined" && supabaseServiceRoleKey
  ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Debug log for server-side only
if (typeof window === "undefined") {
  if (!supabaseServiceRoleKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not set. supabaseAdmin client will not function. This is only relevant for server-side operations.");
  } else {
    console.log("SUPABASE_SERVICE_ROLE_KEY is set and available for supabaseAdmin.");
  }
}