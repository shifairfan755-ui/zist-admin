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
   useEffect(() => {
  const init = async () => {
    console.log("INIT START");

    setLoading(true);

    const sessionResponse = await supabase.auth.getSession();
    console.log("SESSION RESPONSE:", sessionResponse);

    const session = sessionResponse.data.session;

    if (!session?.user) {
      console.log("NO SESSION USER");
      setUser(null);
      setLoading(false);
      return;
    }

    console.log("SESSION USER FOUND:", session.user.email);

    const profile = await loadZistUser(session.user.email!);
    console.log("PROFILE:", profile);

    setUser(
      profile ?? {
        email: session.user.email,
        role: "viewer",
        full_name: "",
      }
    );

    setLoading(false);
    console.log("INIT DONE");
  };

  init();
}, []);

