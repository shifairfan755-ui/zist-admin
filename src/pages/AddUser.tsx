import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AddUser() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ---------------------------------------------------------
      // ⭐ STEP 1 — CREATE AUTH USER (using service role key)
      // ---------------------------------------------------------

      const url = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${
            import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
          }`,
          apikey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          email_confirm: true,
        }),
      });

      const data = await response.json();
      console.log("ADMIN CREATE RESPONSE:", data);

      if (!response.ok) {
        alert("Error creating auth user: " + JSON.stringify(data));
        setLoading(false);
        return;
      }

      const userId = data.user?.id;

      if (!userId) {
        alert("❌ Failed — No user ID returned from Supabase.");
        setLoading(false);
        return;
      }

      // ---------------------------------------------------------
      // ⭐ STEP 2 — INSERT NAME INTO LOCAL users TABLE
      // ---------------------------------------------------------
      const { error: usersTableError } = await supabase
        .from("users")
        .insert({
          id: userId,
          name: name.trim(),
          email: email.trim(),
        });

      if (usersTableError) {
        alert("Error inserting into users table: " + usersTableError.message);
        setLoading(false);
        return;
      }

      // ---------------------------------------------------------
      // ⭐ STEP 3 — ASSIGN ROLE IN user_role TABLE
      // ---------------------------------------------------------
      const { error: roleError } = await supabase.from("user_role").insert({
        user_id: userId,
        role: role.toLowerCase(),
      });

      if (roleError) {
        alert("Error saving role: " + roleError.message);
        setLoading(false);
        return;
      }

      alert("✅ User created successfully!");
      navigate("/users");
    } catch (err: any) {
      console.error("Unexpected Error:", err);
      alert("Unexpected error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow p-6 rounded">
      <h2 className="text-2xl font-bold mb-4">Add User</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <input
          type="text"
          className="w-full p-3 border rounded"
          placeholder="User Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Email */}
        <input
          type="email"
          className="w-full p-3 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password */}
        <input
          type="password"
          className="w-full p-3 border rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Role */}
        <select
          className="w-full p-3 border rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="viewer">Viewer</option>
        </select>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
}
