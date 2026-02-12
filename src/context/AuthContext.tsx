import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type UserType = {
  email: string;
  role: string;
  full_name: string;
} | null;

type AuthContextType = {
  user: UserType;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (email: string) => {
    const { data, error } = await supabase
      .from("zist_users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Profile fetch error:", error.message);
      return null;
    }

    return data;
  };

  const initialize = async () => {
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        setUser(null);
        return;
      }

      const profile = await fetchProfile(session.user.email);

      setUser(
        profile ?? {
          email: session.user.email,
          role: "viewer",
          full_name: "",
        }
      );
    } catch (err) {
      console.error("Auth initialization error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    initialize();

    // Listen for login/logout changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      initialize();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
