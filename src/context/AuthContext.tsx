import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type UserType = {
  email: string;
  role: string;
  full_name: string;
} | null;

const AuthContext = createContext<{
  user: UserType;
  loading: boolean;
}>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType>(null);
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
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;

        if (!session?.user) {
          setUser(null);
          setLoading(false);
          return;
        }

        const profile = await loadZistUser(session.user.email!);

        setUser(
          profile ?? {
            email: session.user.email!,
            role: "viewer",
            full_name: "",
          }
        );
      } catch (err) {
        console.error("Auth error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
