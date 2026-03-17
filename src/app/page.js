import Link from "next/link";

export default function Home() {
  return (
    <div className="auth-container">
      <div className="glass-card" style={{ maxWidth: "500px", textAlign: "center" }}>
        <h1 style={{ marginBottom: "16px", fontSize: "28px", color: "var(--primary)" }}>Clinic Queue Management</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "32px", fontSize: "16px" }}>
          Welcome to the multi-tenant clinic management system. Please login to continue.
        </p>
        <Link href="/login" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
          Go to Login
        </Link>
      </div>
    </div>
  );
}
