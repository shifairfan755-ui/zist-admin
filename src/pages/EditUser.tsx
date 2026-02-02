import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";

export default function EditUser() {
  const { id } = useParams();
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("staff");
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data } = await supabase.from("users").select("*").eq("id", id).single();

    if (data) {
      setFullName(data.full_name);
      setRole(data.role);
    }
  };

  const updateUser = async () => {
    await supabase.from("users").update({
      full_name: fullName,
      role,
    }).eq("id", id);

    alert("User updated!");
    navigate("/users");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit User</h1>

      <div className="bg-white shadow p-6 rounded-lg space-y-4">
        <input
          className="border p-3 w-full rounded"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <select
          className="border p-3 w-full rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>

        <button
          onClick={updateUser}
          className="bg-blue-600 text-white px-4 py-3 rounded w-full"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
