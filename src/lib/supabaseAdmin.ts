import { createClient } from "@supabase/supabase-js";

// ⚠️ IMPORTANT: service_role key must NEVER be exposed to browser
// We must load it from Vite environment variables

const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY, // service key
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

export default supabaseAdmin;
