"use client";

import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "var(--primary)", fontWeight: "700" }}>Admin Panel</h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
              {user?.clinicName} ({user?.clinicCode})
            </p>
          </div>
          <nav style={{ flex: 1 }}>
            <ul style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>
                <div style={{ padding: "10px", backgroundColor: "var(--background)", borderRadius: "8px", fontWeight: "500" }}>
                  User Management
                </div>
              </li>
            </ul>
          </nav>
          <div style={{ marginTop: "auto", borderTop: "1px solid #e2e8f0", paddingTop: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
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
