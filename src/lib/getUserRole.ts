import { supabase } from "./supabaseClient";

export async function getUserRole() {
  // Get current session
  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError || !user) {
    console.error("No logged-in user");
    return null;
  }

  // Fetch user profile
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Profile fetch error:", error.message);
    return null;
  }

  return data?.role || null;
}
