import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getUserRole } from "../lib/getUserRole";

export default function RequireRole({ roles, children }) {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setRole(null);
        setLoading(false);
        return;
      }
      const r = await getUserRole();
      setRole(r);
      setLoading(false);
    }
    check();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (!role || !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
