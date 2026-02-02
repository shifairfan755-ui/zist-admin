import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// MUST EXPORT LIKE THIS — NAMED EXPORT
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
