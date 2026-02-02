import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadSession();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const loadSession = async () => {
    setLoading(true);

    const { data } = await supabase.auth.getSession();
    const sessionUser = data?.session?.user;

    if (!sessionUser) {
      setUser(null);
      setRole(null);
      return setLoading(false);
    }

    setUser(sessionUser);

    // correct table name
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", sessionUser.id)
      .maybeSingle(); // prevents errors

    setRole(roleRow?.role || null);
    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
