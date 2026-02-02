import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

import { useEffect, useState } from "react";

export default function ProtectedRoute() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
