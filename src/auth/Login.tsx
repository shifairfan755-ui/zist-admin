import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getUserRole } from "../lib/getUserRole";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ----------------------------
  // HANDLE LOGIN
  // ----------------------------
  async function handleLogin(e: any) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // LOGIN WITH SUPABASE
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // GET ROLE FROM PROFILES TABLE
      const role = await getUserRole();
      console.log("Logged-in user role:", role);

      // REDIRECT BY ROLE
     if (role === "admin") {
  navigate("/dashboard");
} else if (role === "staff") {
  navigate("/dashboard");
} else {
  navigate("/dashboard");
}


    } catch (err: any) {
      setErrorMsg("Something went wrong. Try again.");
    }

    setLoading(false);
  }

  // ----------------------------
  // UI
  // ----------------------------
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
      <h2>Zist Login</h2>

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
