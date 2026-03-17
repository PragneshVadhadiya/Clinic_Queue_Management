"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("23010101284@darshan.ac.in");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const demoEmail = localStorage.getItem("demoEmail");
    const demoPassword = localStorage.getItem("demoPassword");
    if (demoEmail && demoPassword) {
      setEmail(demoEmail);
      setPassword(demoPassword);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card" style={{ maxWidth: "420px" }}>
        <h2 style={{ marginBottom: "24px", textAlign: "center", fontSize: "28px", color: "var(--primary)" }}>
          Sign In
        </h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "12px", height: "48px" }}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
