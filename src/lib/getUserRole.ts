import { supabase } from "./supabaseClient";

export async function getUserRole(email: string) {
  const { data, error } = await supabase
    .from("zist_users")
    .select("role")
    .eq("email", email)
    .maybeSingle();

  if (error || !data) return "viewer";
  return data.role;
}
