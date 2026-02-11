import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: any) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // 1️⃣ LOGIN WITH SUPABASE AUTH
      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        setErrorMsg(loginError.message);
        setLoading(false);
        return;
      }

      const authUser = loginData.user;

      if (!authUser) {
        setErrorMsg("Login failed — No user returned.");
        setLoading(false);
        return;
      }

      // 2️⃣ OPTIONAL: Check if this email exists in zist_users
      const { data: userRow, error: userError } = await supabase
        .from("zist_users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (userError || !userRow) {
        setErrorMsg("User profile not found in zist_users.");
        setLoading(false);
        return;
      }

      console.log("LOGIN SUCCESS:", userRow);

      // 3️⃣ DO NOT STORE ANYTHING IN LOCALSTORAGE
      // AuthContext will detect session and fetch role automatically

      // 4️⃣ REDIRECT
      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong.");
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "60px auto",
        textAlign: "center",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      <h2>ZIST Admin Login</h2>

      <form onSubmit={handleLogin} style={{ marginTop: 20 }}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        {errorMsg && (
          <p style={{ color: "red", marginBottom: 10 }}>{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: "#0b5ed7",
            color: "white",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
