import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    // 1️⃣ CREATE USER (Auth)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setErrorMsg(authError.message || "Signup failed");
      setLoading(false);
      return;
    }

    const user = authData.user;
    if (!user) {
      setErrorMsg("Signup failed. No user returned.");
      setLoading(false);
      return;
    }

    // 2️⃣ CREATE PROFILE
  const { error: profileError } = await supabase.from("profiles").insert([
  {
    id: user.id,
    full_name: fullName,
    email: email,
    role: "Viewer",
    status: "Active",
  },
]);

if (profileError) {
  console.log("PROFILE INSERT ERROR:", profileError);
  setErrorMsg("Profile error: " + profileError.message);
  return;
}


    alert("Account created successfully! Please login.");
    setLoading(false);

    navigate("/login");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-xl p-10 rounded-2xl w-[420px]">
        <h2 className="text-3xl font-bold text-center mb-8">
          Create Your Account
        </h2>

        <form onSubmit={handleSignup}>

          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 mb-4 border rounded-lg bg-blue-50"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded-lg bg-blue-50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-4 border rounded-lg bg-blue-50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {errorMsg && (
            <p className="text-red-600 text-center mb-2">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-700 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
