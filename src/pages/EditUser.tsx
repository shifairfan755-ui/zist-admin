import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const { data } = await supabase
      .from("user_roles")
      .select(
        `
      role,
      profiles:user_id (
        full_name,
        email
      )
    `
      )
      .eq("user_id", id)
      .single();

    setFullName(data.profiles.full_name);
    setEmail(data.profiles.email);
    setRole(data.role);
  }

  async function save() {
    await supabase.from("user_roles").update({ role }).eq("user_id", id);
    alert("Updated!");
    navigate("/users");
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-xl">
      <h1 className="text-2xl font-bold mb-4">Edit User</h1>

      <input disabled value={fullName} className="w-full p-2 mb-3 bg-gray-200 rounded" />

      <input disabled value={email} className="w-full p-2 mb-3 bg-gray-200 rounded" />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      >
        <option value="admin">Admin</option>
        <option value="staff">Staff</option>
        <option value="viewer">Viewer</option>
      </select>

      <button onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded">
        Save Changes
      </button>
    </div>
  );
}
