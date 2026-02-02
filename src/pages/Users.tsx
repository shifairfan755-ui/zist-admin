import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("users")        // ✔ Correct table
      .select("id, full_name, email, role") // ✔ No status
      .order("full_name", { ascending: true });

    if (error) {
      console.error("USER LOAD ERROR:", error);
    } else {
      setUsers(data);
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="p-6 text-gray-600 text-xl">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Users</h1>
        <Link
          to="/add-user"
          className="px-5 py-2 bg-purple-600 text-white rounded-lg"
        >
          + Add User
        </Link>
      </div>

      <table className="w-full bg-white shadow-md rounded-lg">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-3 text-left">Full Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u: any) => (
            <tr key={u.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{u.full_name}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">
                <span className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                  {u.role}
                </span>
              </td>

              <td className="p-3 flex gap-4">
                <Link to={`/edit-user/${u.id}`} className="text-blue-600">
                  Edit
                </Link>
                <Link to={`/view-user/${u.id}`} className="text-green-600">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
