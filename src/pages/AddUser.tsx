import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

export default function AddUser() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    setLoading(true);

    try {
      // 🔐 Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        toast.error("You must be logged in");
        setLoading(false);
        return;
      }

      // 🚀 Call Edge Function
      const response = await fetch(
        "https://aggblvrhdkjjqyzzbkep.supabase.co/functions/v1/create-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            email,
            full_name: fullName,
            role,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to create user");
        setLoading(false);
        return;
      }

      toast.success("User created successfully!");
      navigate("/users");

    } catch (err) {
      console.error("Create user error:", err);
      toast.error("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <Link to="/users" className="text-blue-600">
        ← Back to Users
      </Link>

      <h1 className="text-3xl font-bold mt-4 mb-6">
        Add New User
      </h1>

      <form
        onSubmit={handleCreate}
        className="bg-white shadow-xl rounded-xl p-6 border space-y-6"
      >
        {/* Full Name */}
        <div>
          <label className="block mb-2 font-medium">
            Full Name
          </label>
          <input
            type="text"
            className="w-full border p-3 rounded-lg"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-2 font-medium">
            Email Address
          </label>
          <input
            type="email"
            className="w-full border p-3 rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@email.com"
            required
          />
        </div>

        {/* Role */}
        <div>
          <label className="block mb-2 font-medium">
            Role
          </label>
          <select
            className="w-full border p-3 rounded-lg"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="admin">admin</option>
            <option value="staff">staff</option>
            <option value="viewer">viewer</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
}
