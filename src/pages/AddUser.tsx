import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AddUser() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "Staff",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1) CREATE AUTH USER (or get existing user)
      const { data: authUser, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: form.email,
          password: form.password,
          email_confirm: true,
        });

      // If user already exists in Auth
      if (authError && authError.message.includes("already been registered")) {
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existing = existingUsers.users.find(
          (u: any) => u.email === form.email
        );

        if (!existing) {
          alert("Unexpected: user exists but cannot fetch user_id");
          setLoading(false);
          return;
        }

        alert("User already exists, updating records...");
        handleExistingUser(existing.id);
        return;
      }

      if (authError) {
        alert("Auth Error: " + authError.message);
        setLoading(false);
        return;
      }

      const user_id = authUser.user?.id;

      if (!user_id) {
        alert("Auth user created but no user_id returned!");
        setLoading(false);
        return;
      }

      await saveUserInDB(user_id);

    } catch (err: any) {
      alert("Unexpected error: " + err.message);
    }

    setLoading(false);
  };

  // Save or Update DB Tables
  const saveUserInDB = async (user_id: string) => {
    // CHECK IF PROFILE EXISTS
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user_id)
      .maybeSingle();

    // INSERT or UPDATE profiles
    if (existingProfile) {
      await supabase.from("profiles").update({
        full_name: form.full_name,
        email: form.email,
      }).eq("id", user_id);
    } else {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: user_id, full_name: form.full_name, email: form.email }]);

      if (profileError) {
        alert("Profile insert failed: " + profileError.message);
        return;
      }
    }

    // public.users
    await supabase.from("users").upsert([
      {
        id: user_id,
        full_name: form.full_name,
        email: form.email,
        role: form.role.toLowerCase(),
      },
    ]);

    // user_roles
    await supabase.from("user_roles").upsert([
      {
        user_id,
        role: form.role.toLowerCase(),
        status: "active",
        is_disabled: false,
      },
    ]);

    alert("User saved successfully!");
    navigate("/users");
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Add User</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <input
          name="full_name"
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
          className="border p-3 rounded w-full"
          required
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border p-3 rounded w-full"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border p-3 rounded w-full"
          required
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="border p-3 rounded w-full"
        >
          <option value="Admin">Admin</option>
          <option value="Staff">Staff</option>
          <option value="Viewer">Viewer</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-700 text-white p-3 rounded w-full text-lg font-semibold"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
}
