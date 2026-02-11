import { supabase } from "../lib/supabaseClient";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      await supabase.auth.signOut();
      navigate("/login");
    };

    logout();
  }, []);

  return <p>Logging out...</p>;
}
