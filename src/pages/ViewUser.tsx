import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useParams, Link } from "react-router-dom";

export default function ViewUser() {
  const { id } = useParams(); // this is user_id, not row id
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setUser(data);
  };

  if (!user) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-lg">

      <h1 className="text-3xl font-bold mb-4">User Details</h1>

      <p className="mb-2"><strong>Full Name:</strong> {user.full_name}</p>
      <p className="mb-2"><strong>Email:</strong> {user.email}</p>
      <p className="mb-2"><strong>Role:</strong> {user.role}</p>

      <p className="mb-4 text-gray-600">
        <strong>Created:</strong>{" "}
        {new Date(user.created_at).toLocaleString()}
      </p>

      <Link
        to={`/users/edit/${id}`}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Edit User
      </Link>

    </div>
  );
}
