"use client";

import { useState, useEffect } from "react";
import { api } from "../../services/api";

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeTab, setActiveTab] = useState("dashboard");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  const [activeDetails, setActiveDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/appointments/my", token);
      setAppointments(res.appointments || res);
    } catch (err) {
      setError(err.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    const handleTabChange = (e) => {
      setActiveTab(e.detail);
      setError("");
      setSuccess("");
    };
    window.addEventListener("changeTab", handleTabChange);
    return () => window.removeEventListener("changeTab", handleTabChange);
  }, []);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const res = await api.post("/appointments", { appointmentDate: bookingDate, timeSlot: bookingTime }, token);
      const bookedToken = res?.queueEntry?.tokenNumber || res?.tokenNumber || res?.id || "1";
      setSuccess(`Booked! Token #${bookedToken}. You can see it in My Appointments.`);
      setBookingDate("");
      setBookingTime("");
      fetchAppointments();
    } catch (err) {
      setError(err.message || "Failed to book appointment.");
    }
  };

  const loadDetails = async (id) => {
    setLoadingDetails(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const data = await api.get(`/appointments/${id}`, token);
      setActiveDetails(data);
      setActiveTab("details");
    } catch (err) {
      setError(err.message || "Failed to load appointment details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting": return { bg: "#fef3c7", color: "#92400e" };
      case "queued": return { bg: "#fef3c7", color: "#92400e" };
      case "in_progress": return { bg: "#dbeafe", color: "#1e40af" };
      case "in-progress": return { bg: "#dbeafe", color: "#1e40af" };
      case "done": return { bg: "#dcfce7", color: "#166534" };
      case "skipped": return { bg: "#fee2e2", color: "#991b1b" };
      default: return { bg: "#fef3c7", color: "#92400e" };
    }
  };

  return (
    <div>
      {activeTab === "dashboard" && (
        <>
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1c7b74" }}>Patient Dashboard</h1>
          </div>
          <div style={{ marginBottom: "40px", backgroundColor: "white", padding: "32px", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1e293b", marginBottom: "16px" }}>Welcome</h2>
            <p style={{ color: "#475569", fontSize: "15px", marginBottom: "24px" }}>
              Use the menu to book an appointment, view your appointments, prescriptions, or medical reports.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={() => setActiveTab("book")}
                style={{ padding: "10px 20px", backgroundColor: "#148f86", color: "white", border: "none", borderRadius: "6px", fontWeight: "500", fontSize: "14px", cursor: "pointer" }}
              >
                Book Appointment
              </button>
              <button onClick={() => setActiveTab("appointments")} style={{ padding: "10px 20px", backgroundColor: "#e2e8f0", color: "#334155", border: "none", borderRadius: "6px", fontWeight: "500", fontSize: "14px", cursor: "pointer" }}>
                My Appointments
              </button>
              <button onClick={() => setActiveTab("prescriptions")} style={{ padding: "10px 20px", backgroundColor: "#e2e8f0", color: "#334155", border: "none", borderRadius: "6px", fontWeight: "500", fontSize: "14px", cursor: "pointer" }}>
                My Prescriptions
              </button>
              <button style={{ padding: "10px 20px", backgroundColor: "#e2e8f0", color: "#334155", border: "none", borderRadius: "6px", fontWeight: "500", fontSize: "14px", cursor: "pointer" }}>
                My Reports
              </button>
            </div>
          </div>
        </>
      )}

      {error && <div className="alert alert-danger" style={{ marginBottom: "24px" }}>{error}</div>}

      {activeTab === "appointments" && (
        <div>
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#1c7b74", margin: 0 }}>My Appointments</h1>
          </div>
          <div style={{ backgroundColor: "white", padding: "8px 24px", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "16px 8px", fontWeight: "600", color: "#475569", fontSize: "14px" }}>Date</th>
                  <th style={{ padding: "16px 8px", fontWeight: "600", color: "#475569", fontSize: "14px" }}>Time</th>
                  <th style={{ padding: "16px 8px", fontWeight: "600", color: "#475569", fontSize: "14px" }}>Token</th>
                  <th style={{ padding: "16px 8px", fontWeight: "600", color: "#475569", fontSize: "14px" }}>Status</th>
                  <th style={{ padding: "16px 8px", fontWeight: "600", color: "#475569", fontSize: "14px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ padding: "24px 8px", color: "#64748b" }}>Loading appointments...</td></tr>
                ) : appointments && appointments.length > 0 ? (
                  appointments.map((apt) => {
                    const colors = getStatusColor(apt.status);
                    const formattedDate = new Date(apt.appointmentDate || apt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    return (
                      <tr key={apt._id || apt.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "16px 8px", fontSize: "14.5px", color: "#334155", fontWeight: "500" }}>{formattedDate}</td>
                        <td style={{ padding: "16px 8px", fontSize: "14.5px", color: "#334155", fontWeight: "500" }}>{apt.timeSlot || apt.time || "-"}</td>
                        <td style={{ padding: "16px 8px", fontSize: "14.5px", color: "#334155", fontWeight: "500" }}>{apt.queueEntry?.tokenNumber || apt.queueEntry?.token || apt.tokenNumber || "1"}</td>
                        <td style={{ padding: "16px 8px" }}>
                          <span style={{ backgroundColor: colors.bg, color: colors.color, padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>
                            {apt.status?.replace("queued", "waiting").replace("_", " ") || "waiting"}
                          </span>
                        </td>
                        <td style={{ padding: "16px 8px" }}>
                          <button onClick={() => loadDetails(apt.id || apt._id)} style={{ backgroundColor: "#148f86", color: "white", padding: "8px 16px", borderRadius: "6px", border: "none", fontSize: "12.5px", fontWeight: "500", cursor: "pointer" }}>
                            {loadingDetails ? "Loading..." : "Medicines & report"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="5" style={{ padding: "24px 8px", color: "#64748b", textAlign: "center" }}>You haven't booked any appointments yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "book" && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#148f86", margin: 0 }}>Book Appointment</h1>
          </div>
          
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", maxWidth: "1000px" }}>
            {success && (
              <div style={{ backgroundColor: "#d1fae5", color: "#065f46", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px", fontSize: "14.5px" }}>
                {success}
              </div>
            )}
            <form onSubmit={handleBookAppointment}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", color: "#334155", fontWeight: "500", marginBottom: "6px", display: "block" }}>Date</label>
                <input
                  required
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", color: "#1e293b", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "13px", color: "#334155", fontWeight: "500", marginBottom: "6px", display: "block" }}>Time slot</label>
                <select 
                  required
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #3b82f6", fontSize: "14px", backgroundColor: "white", color: "#1e293b", boxSizing: "border-box", outline: "none" }}>
                  <option value="">Select slot</option>
                  <option value="09:00-09:15">09:00-09:15</option>
                  <option value="09:15-09:30">09:15-09:30</option>
                  <option value="09:30-09:45">09:30-09:45</option>
                  <option value="09:45-10:00">09:45-10:00</option>
                  <option value="10:00-10:15">10:00-10:15</option>
                  <option value="10:15-10:30">10:15-10:30</option>
                  <option value="10:30-10:45">10:30-10:45</option>
                  <option value="10:45-11:00">10:45-11:00</option>
                  <option value="14:00-14:15">14:00-14:15</option>
                  <option value="14:15-14:30">14:15-14:30</option>
                  <option value="14:30-14:45">14:30-14:45</option>
                  <option value="14:45-15:00">14:45-15:00</option>
                  <option value="15:00-15:15">15:00-15:15</option>
                  <option value="15:15-15:30">15:15-15:30</option>
                  <option value="15:30-15:45">15:30-15:45</option>
                  <option value="15:45-16:00">15:45-16:00</option>
                  <option value="16:00-16:15">16:00-16:15</option>
                  <option value="16:15-16:30">16:15-16:30</option>
                  <option value="16:30-16:45">16:30-16:45</option>
                  <option value="16:45-17:00">16:45-17:00</option>
                </select>
              </div>
              <div>
                <button type="submit" style={{ backgroundColor: "#148f86", color: "white", border: "none", borderRadius: "6px", padding: "8px 24px", fontWeight: "500", fontSize: "14px", cursor: "pointer" }}>
                  Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MY PRESCRIPTIONS */}
      {activeTab === "prescriptions" && (
        <div>
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#1c7b74", margin: 0 }}>My Prescriptions</h1>
          </div>
          
          <div style={{ backgroundColor: "white", padding: "32px 24px", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            {}
            <p style={{ margin: 0, color: "#334155", fontSize: "15px" }}>
              No prescriptions yet. Medicines suggested by the doctor will appear here after your visit.
            </p>
          </div>
        </div>
      )}

      {/* INLINE APPOINTMENT DETAILS */}
      {activeTab === "details" && activeDetails && (
        <div>
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1c7b74", margin: "0 0 20px 0" }}>Appointment details</h1>
            <button 
              onClick={() => { setActiveTab("appointments"); setActiveDetails(null); }}
              style={{ padding: "8px 18px", backgroundColor: "#e2e8f0", color: "#334155", border: "none", borderRadius: "20px", fontSize: "13.5px", fontWeight: "500", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <span>←</span> Back to appointments
            </button>
          </div>
          
          {loadingDetails ? (
            <div style={{ color: "#64748b" }}>Loading appointment records...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "960px" }}>
              
              {/* Appointment Overview */}
              <div style={{ backgroundColor: "white", padding: "28px 32px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", marginBottom: "20px", marginTop: 0 }}>Appointment</h3>
                <div style={{ fontSize: "15.5px", color: "#334155", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <strong>Date:</strong> {new Date(activeDetails.appointmentDate || activeDetails.date || activeDetails.appointment?.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} <span style={{ margin: "0 8px", color: "#94a3b8" }}>·</span> <strong>Time:</strong> {activeDetails.timeSlot || activeDetails.time || activeDetails.appointment?.timeSlot || "-"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <strong>Token:</strong> <span style={{ marginLeft: "2px" }}>{activeDetails.queueEntry?.tokenNumber || activeDetails.tokenNumber || "1"}</span> <span style={{ margin: "0 8px", color: "#94a3b8" }}>·</span> <strong>Status:</strong> 
                    <span style={{ backgroundColor: getStatusColor(activeDetails.status).bg, color: getStatusColor(activeDetails.status).color, padding: "3px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", marginLeft: "4px", display: "inline-flex", alignItems: "center" }}>
                      {activeDetails.status?.replace("queued", "waiting").replace("-", " ").replace("_", " ") || "waiting"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medicines (Prescription) */}
              <div style={{ backgroundColor: "white", padding: "28px 32px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", marginBottom: "20px", marginTop: 0 }}>Medicines (Prescription)</h3>
                {!activeDetails.prescription || !activeDetails.prescription?.medicines || activeDetails.prescription.medicines.length === 0 ? (
                  <p style={{ color: "#64748b", fontSize: "15px", margin: 0 }}>No prescription added for this appointment yet.</p>
                ) : (
                  <div>
                    {activeDetails.prescription.notes && (
                      <p style={{ marginBottom: "20px", fontSize: "14.5px", color: "#334155" }}><strong>Doctor's Notes:</strong> {activeDetails.prescription.notes}</p>
                    )}
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14.5px" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
                          <th style={{ paddingBottom: "8px", color: "#475569", fontWeight: "600" }}>Medicine</th>
                          <th style={{ paddingBottom: "8px", color: "#475569", fontWeight: "600" }}>Dosage</th>
                          <th style={{ paddingBottom: "8px", color: "#475569", fontWeight: "600" }}>Duration</th>
                          <th style={{ paddingBottom: "8px", color: "#475569", fontWeight: "600" }}>Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeDetails.prescription.medicines.map((med, index) => (
                          <tr key={index} style={{ borderBottom: "1px solid #e2e8f0" }}>
                            <td style={{ padding: "12px 0", fontWeight: "500", color: "#1e293b" }}>{med.name}</td>
                            <td style={{ padding: "12px 0", color: "#334155" }}>{med.dosage}</td>
                            <td style={{ padding: "12px 0", color: "#334155" }}>{med.duration} Days</td>
                            <td style={{ padding: "12px 0", color: "#64748b" }}>{med.instructions || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Medical Report */}
              <div style={{ backgroundColor: "white", padding: "28px 32px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", marginBottom: "20px", marginTop: 0 }}>Medical Report</h3>
                {!activeDetails.report ? (
                  <p style={{ color: "#64748b", fontSize: "15px", margin: 0 }}>No report added for this appointment yet.</p>
                ) : (
                  <div style={{ fontSize: "14.5px", color: "#334155" }}>
                    <p style={{ marginBottom: "12px" }}><strong>Diagnosis:</strong> {activeDetails.report.diagnosis}</p>
                    {activeDetails.report.tests && activeDetails.report.tests.length > 0 && (
                      <div style={{ marginBottom: "12px" }}>
                        <strong>Required Tests:</strong>
                        <ul style={{ marginTop: "8px", paddingLeft: "20px", listStyleType: "disc" }}>
                          {activeDetails.report.tests.map((t, index) => <li key={index} style={{ marginBottom: "4px" }}>{t}</li>)}
                        </ul>
                      </div>
                    )}
                    {activeDetails.report.remarks && (
                      <p><strong>Remarks:</strong> {activeDetails.report.remarks}</p>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}
