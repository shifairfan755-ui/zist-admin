import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong.");
    }

    setLoading(false);
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (!email) {
      setErrorMsg("Enter your email.");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:5173/reset-password",
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      alert("Password reset email sent!");
      setShowReset(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to send reset email.");
    }
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

      {!showReset ? (
        <form onSubmit={handleLogin} style={{ marginTop: 20 }}>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          {errorMsg && (
            <p style={{ color: "red", marginBottom: 10 }}>{errorMsg}</p>
          )}

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            type="button"
            onClick={() => {
              setErrorMsg("");
              setShowReset(true);
            }}
            style={linkStyle}
          >
            Forgot Password?
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} style={{ marginTop: 20 }}>
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          {errorMsg && (
            <p style={{ color: "red", marginBottom: 10 }}>{errorMsg}</p>
          )}

          <button type="submit" style={buttonStyle}>
            Send Reset Link
          </button>

          <button
            type="button"
            onClick={() => setShowReset(false)}
            style={linkStyle}
          >
            Back to Login
          </button>
        </form>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  background: "#0b5ed7",
  color: "white",
  borderRadius: "5px",
  border: "none",
  cursor: "pointer",
};

const linkStyle = {
  marginTop: "10px",
  background: "transparent",
  border: "none",
  color: "#0b5ed7",
  cursor: "pointer",
};
