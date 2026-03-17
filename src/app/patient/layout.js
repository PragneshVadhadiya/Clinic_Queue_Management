"use client";

import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function PatientLayout({ children }) {
  const { user, logout } = useAuth();

  const navItem = (label, tab) => (
    <li>
      <div
        onClick={() => window.dispatchEvent(new CustomEvent("changeTab", { detail: tab }))}
        style={{
          padding: "10px 14px",
          borderRadius: "8px",
          fontWeight: "500",
          fontSize: "14px",
          cursor: "pointer",
          color: "var(--text-primary)",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e2e8f0")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        {label}
      </div>
    </li>
  );

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "var(--primary)", fontWeight: "700" }}>Patient Panel</h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
              {user?.clinicName} ({user?.clinicCode})
            </p>
          </div>
          <nav style={{ flex: 1 }}>
            <ul style={{ display: "flex", flexDirection: "column", gap: "4px", listStyle: "none", padding: 0, margin: 0 }}>
              {navItem("Dashboard", "dashboard")}
              {navItem("Book Appointment", "book")}
              {navItem("My Appointments", "appointments")}
              {navItem("My Prescriptions", "prescriptions")}
              {navItem("My Reports", "reports")}
            </ul>
          </nav>
          <div style={{ marginTop: "auto", borderTop: "1px solid #e2e8f0", paddingTop: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "16px" }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: "600", margin: 0 }}>{user?.name}</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>{user?.role}</p>
              </div>
            </div>
            <button onClick={logout} className="btn-primary" style={{ backgroundColor: "var(--danger)" }}>
              Logout
            </button>
          </div>
        </aside>
        <main className="main-content">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
