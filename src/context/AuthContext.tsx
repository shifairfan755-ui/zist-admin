import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadZistUser = async (email: string) => {
    const { data } = await supabase
      .from("zist_users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    return data;
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        setLoading(true);

        // Force Supabase to parse URL tokens
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
          await supabase.auth.signOut();
          setUser(null);
          setLoading(false);
          return;
        }

        if (!session?.user) {
          setUser(null);
          setLoading(false);
          return;
        }

        const profile = await loadZistUser(session.user.email!);

        setUser(
          profile ?? {
            email: session.user.email,
            role: "viewer",
            full_name: "",
          }
        );

        setLoading(false);
      } catch (err) {
        console.error("Init session failed:", err);
        await supabase.auth.signOut();
        setUser(null);
        setLoading(false);
      }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      const profile = await loadZistUser(session.user.email!);

      setUser(
        profile ?? {
          email: session.user.email,
          role: "viewer",
          full_name: "",
        }
      );

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
