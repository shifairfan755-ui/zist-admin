// src/pages/RoleManager.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function RoleManager() {
  const { role } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, role");

    if (error) console.log(error);

    setUsers(data || []);
    setLoading(false);
  };

  const updateRole = async (id: string, newRole: string) => {
    await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", id);

    loadUsers();
  };

  if (role !== "admin") {
    return (
      <div className="p-6 text-red-600 font-semibold text-center">
        Access Denied – Admins only
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">User Role Manager</h1>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Full Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-3">{u.full_name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded bg-gray-100">
                    {u.role}
                  </span>
                </td>

                <td className="p-3">
                  <select
                    className="border p-2 rounded"
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
