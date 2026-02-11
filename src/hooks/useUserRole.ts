import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function useUserRole() {
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRole();
  }, []);

  async function loadRole() {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (!session) {
      setRole("");
      setLoading(false);
      return;
    }

    const userId = session.user.id;

    // THE CORRECT TABLE
    const { data, error } = await supabase
      .from("zist_users")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("ROLE FETCH ERROR:", error);
      setRole("viewer"); // fallback
      setLoading(false);
      return;
    }

    setRole(data?.role || "viewer"); // viewer fallback
    setLoading(false);
  }

  return { role, loading };
}
