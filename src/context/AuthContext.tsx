import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadZistUser = async (email: string) => {
    const { data } = await supabase
      .from("zist_users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    return data;
  };

  const initSession = async () => {
    const { data } = await supabase.auth.getSession();
    const sessionUser = data?.session?.user;

    if (!sessionUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    const profile = await loadZistUser(sessionUser.email);

    setUser(
      profile ?? {
        email: sessionUser.email,
        role: "viewer",
        full_name: "",
      }
    );

    setLoading(false);
  };

  useEffect(() => {
    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        const sessionUser = session?.user;

        if (!sessionUser) {
          setUser(null);
          return setLoading(false);
        }

        const z = await loadZistUser(sessionUser.email);

        setUser(
          z ?? {
            email: sessionUser.email,
            role: "viewer",
            full_name: "",
          }
        );

        setLoading(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
