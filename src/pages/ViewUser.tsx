import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useParams } from "react-router-dom";

export default function ViewUser() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data } = await supabase.from("users").select("*").eq("id", id).single();
    setUser(data);
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded-lg">
      <h1 className="text-3xl font-bold mb-4">User Details</h1>

      <p><strong>Name:</strong> {user.full_name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
    </div>
  );
}
