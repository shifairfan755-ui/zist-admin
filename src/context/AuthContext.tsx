import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: any;
  role: string | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkSession();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();
    const sessionUser = data?.session?.user;

    if (!sessionUser) {
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }

    setUser(sessionUser);

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", sessionUser.id)
      .maybeSingle();

    setRole(roleRow?.role || null);
    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();

    localStorage.clear();
    sessionStorage.clear();

    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext) as AuthContextType;
}
