import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("zist_users")
      .select("id, full_name, email, role");

    if (error) {
      toast.error("Failed to load users");
      setLoading(false);
      return;
    }

    const formatted =
  data?.map((u: any) => ({
    id: u.id,
    full_name: u.full_name || "No Name",
    email: u.email,
    role: u.role || "viewer",
    status: "active",
  })) || [];

    setUsers(formatted);
    setLoading(false);
  }

  async function updateRole(userId: string, role: string) {
    const { error } = await supabase
      .from("zist_users")
      .update({ role })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to update role");
      return;
    }

    toast.success("Role updated");
    loadUsers();
  }

  async function deleteUser(userId: string) {
    const confirmDelete = confirm("Delete this user permanently?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("zist_users")
      .delete()
      .eq("id", userId);

    if (error) {
      toast.error("Failed to delete user");
      return;
    }

    toast.success("User deleted");
    loadUsers();
  }

  if (loading) return <p className="p-6">Loading...</p>;

  const total = users.length;
  const admins = users.filter((u) => u.role === "admin").length;
  const staff = users.filter((u) => u.role === "staff").length;
  const viewers = users.filter((u) => u.role === "viewer").length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            User Management
          </h1>
          <p className="text-gray-500 mt-2">
            Manage system users and permissions
          </p>
        </div>

        <button
          onClick={() => navigate("/users/add")}
          className="bg-black text-white px-6 py-3 rounded-xl shadow hover:bg-gray-800"
        >
          + Add User
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card title="Total Users" value={total} />
        <Card title="Admins" value={admins} color="bg-blue-600" />
        <Card title="Staff" value={staff} color="bg-green-600" />
        <Card title="Viewers" value={viewers} color="bg-yellow-500" />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-semibold">{u.full_name}</div>
                  <div className="text-gray-500 text-xs">{u.email}</div>
                </td>

                <td className="p-4">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    className="border px-3 py-1 rounded-lg"
                  >
                    <option value="admin">admin</option>
                    <option value="staff">staff</option>
                    <option value="viewer">viewer</option>
                  </select>
                </td>

                <td className="p-4">
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="px-4 py-1 rounded-lg text-white bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ title, value, color = "bg-gray-800" }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border">
      <p className="text-gray-500 text-sm">{title}</p>
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-3xl font-bold">{value}</h2>
        <div className={`w-10 h-10 rounded-xl ${color}`} />
      </div>
    </div>
  );
}
