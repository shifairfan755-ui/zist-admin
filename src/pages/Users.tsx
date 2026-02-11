import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("zist_users")
      .select("id, email, role")
      .order("email", { ascending: true });

    if (!error) setUsers(data || []);
    setLoading(false);
  }

  async function updateRole(id: string, newRole: string) {
    const { error } = await supabase
      .from("zist_users")
      .update({ role: newRole })
      .eq("id", id);

    if (error) {
      alert("Failed to update role");
      return;
    }

    alert("Role updated successfully");
    loadUsers();
  }

  if (loading) return <div className="p-6">Loading users...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <table className="w-full border rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 border">Email</th>
            <th className="p-3 border">Role</th>
            <th className="p-3 border">Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="p-3 border">{u.email}</td>

              <td className="p-3 border">
                <span
                  className={`px-3 py-1 rounded text-white ${
                    u.role === "Admin" ? "bg-green-600" : "bg-blue-600"
                  }`}
                >
                  {u.role}
                </span>
              </td>

              <td className="p-3 border">
                <select
                  className="border rounded p-2"
                  value={u.role}
                  onChange={(e) => updateRole(u.id, e.target.value)}
                >
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
