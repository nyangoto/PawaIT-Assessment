// Initializes the client-side Supabase client.
// Uses environment variables for URL and Anon Key.

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase'; // Assuming types are generated here

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Create a single supabase client for interacting with your database
// Use the Database generic for type safety
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Supabase client persists the session automatically
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // Useful for OAuth redirects
    },
}); 