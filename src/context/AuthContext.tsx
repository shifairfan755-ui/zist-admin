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

  const initSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error);
        await supabase.auth.signOut();
        setUser(null);
        setLoading(false);
        return;
      }

      const sessionUser = data?.session?.user;

      if (!sessionUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const profile = await loadZistUser(sessionUser.email!);

      setUser(
        profile ?? {
          email: sessionUser.email,
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

  useEffect(() => {
    initSession();

    const initSession = async () => {
  setLoading(true);

  // This forces Supabase to parse URL tokens
  await supabase.auth.getSession();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    setUser(null);
    setLoading(false);
    return;
  }

  const profile = await loadZistUser(session.user.email);

  setUser(
    profile ?? {
      email: session.user.email,
      role: "viewer",
      full_name: "",
    }
  );

  setLoading(false);
};

