import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const useUserRole = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRole() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      setRole(profile?.role || null);
      setLoading(false);
    }

    loadRole();
  }, []);

  return { role, loading };
};

export default useUserRole;
