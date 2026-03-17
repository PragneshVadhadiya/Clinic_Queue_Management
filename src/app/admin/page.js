"use client";

import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [clinicInfo, setClinicInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "receptionist",
    phone: "",
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [clinicRes, usersRes] = await Promise.all([
        api.get("/admin/clinic", token),
        api.get("/admin/users", token),
      ]);
      setClinicInfo(clinicRes);
      setUsers(usersRes.users || usersRes); 
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      await api.post("/admin/users", formData, token);
      
      localStorage.setItem("demoEmail", formData.email);
      localStorage.setItem("demoPassword", formData.password);
      
      setSuccess(`${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} created. They can sign in with the email and password you set.`);
      setFormData({ name: "", email: "", password: "", role: "receptionist", phone: "" });
      fetchData(); 
    } catch (err) {
      setError(err.message || "Failed to create user.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const countPatients = (Array.isArray(users) ? users : []).filter(u => u.role === "patient").length;
  const countDoctors = (Array.isArray(users) ? users : []).filter(u => u.role === "doctor").length;
  const countReceptionists = (Array.isArray(users) ? users : []).filter(u => u.role === "receptionist").length;

  return (
    <div style={{ maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: "8px" }}>Dashboard Overview</h1>
          {clinicInfo && (
            <div style={{ display: "flex", gap: "24px", color: "var(--text-muted)" }}>
              <p>Total Patients: <span style={{ fontWeight: "600", color: "var(--foreground)" }}>{countPatients}</span></p>
              <p>Total Doctors: <span style={{ fontWeight: "600", color: "var(--foreground)" }}>{countDoctors}</span></p>
              <p>Total Receptionists: <span style={{ fontWeight: "600", color: "var(--foreground)" }}>{countReceptionists}</span></p>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: "40px", backgroundColor: "white", padding: "24px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>Add receptionist, doctor, or patient</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "20px" }}>
          Create a user in your clinic. They will sign in with the email and password you set (no registration).
        </p>

        {error && <div className="alert alert-danger" style={{ marginBottom: "20px" }}>{error}</div>}
        {success && (
          <div style={{
            backgroundColor: "#d1fae5", color: "#065f46", padding: "12px 16px",
            borderRadius: "6px", fontSize: "14px", marginBottom: "20px"
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleCreateUser}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label style={{ color: "#334155", fontSize: "14px", fontWeight: "600" }}>Name</label>
              <input required type="text" placeholder="At least 3 characters" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ borderRadius: "6px", border: "1px solid #cbd5e1", padding: "10px" }} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label style={{ color: "#334155", fontSize: "14px", fontWeight: "600" }}>Email</label>
              <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ borderRadius: "6px", border: "1px solid #cbd5e1", padding: "10px" }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label style={{ color: "#334155", fontSize: "14px", fontWeight: "600" }}>Password</label>
              <input required type="text" placeholder="Min 6 characters" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ borderRadius: "6px", border: "1px solid #cbd5e1", padding: "10px" }} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label style={{ color: "#334155", fontSize: "14px", fontWeight: "600" }}>Role</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={{ borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "white", padding: "10px" }}>
                <option value="receptionist">Receptionist</option>
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label style={{ color: "#334155", fontSize: "14px", fontWeight: "600", color: "#64748b" }}>Phone <span style={{ fontWeight: "400" }}>(optional)</span></label>
              <input type="text" value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ borderRadius: "6px", border: "1px solid #cbd5e1", padding: "10px" }} />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: "auto", backgroundColor: "#0d9488", padding: "8px 24px", borderRadius: "6px", fontSize: "14px" }}>
            Add user
          </button>
        </form>
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Clinic Users</h2>
        <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--background)", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "16px", fontWeight: "600", color: "var(--text-muted)" }}>Name</th>
              <th style={{ padding: "16px", fontWeight: "600", color: "var(--text-muted)" }}>Email</th>
              <th style={{ padding: "16px", fontWeight: "600", color: "var(--text-muted)" }}>Role</th>
              <th style={{ padding: "16px", fontWeight: "600", color: "var(--text-muted)" }}>ID</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(users) ? users : []).map((u) => (
              <tr key={u._id || u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "16px", fontWeight: "500" }}>{u.name?.replace(/vadhadiya pragnesh(?:kumar)? chamanbhai/gi, "Pragnesh Vadhadiya").replace(/pragneshkumar/gi, "Pragnesh")}</td>
                <td style={{ padding: "16px", color: "var(--text-muted)" }}>{u.email}</td>
                <td style={{ padding: "16px" }}>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "100px",
                    fontSize: "12px",
                    fontWeight: "600",
                    backgroundColor: u.role === "doctor" ? "#dcfce7" : u.role === "patient" ? "#e0e7ff" : "#fef3c7",
                    color: u.role === "doctor" ? "#166534" : u.role === "patient" ? "#3730a3" : "#92400e"
                  }}>
                    {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                  </span>
                </td>
                <td style={{ padding: "16px", color: "var(--text-muted)", fontSize: "14px" }}>
                  {u._id || u.id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      </div>
    </div>
  );
}
