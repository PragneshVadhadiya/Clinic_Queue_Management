"use client";

import { useState, useEffect } from "react";
import { api } from "../../services/api";

export default function ReceptionistDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchQueue = async (date) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/queue?date=${date}`, token);
      setQueue(res.queue || res);
    } catch (err) {
      setError(err.message || "Failed to load the daily queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue(selectedDate);
  }, [selectedDate]);

  const updateStatus = async (id, newStatus) => {
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      await api.patch(`/queue/${id}`, { status: newStatus }, token);
      setSuccess(`Status updated to ${newStatus.replace("-", " ")}`);
      fetchQueue(selectedDate);
    } catch (err) {
      setError(err.message || "Failed to update status.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting": return { bg: "#fef3c7", color: "#92400e" };
      case "in-progress": return { bg: "#dbeafe", color: "#1e40af" };
      case "in_progress": return { bg: "#dbeafe", color: "#1e40af" };
      case "done": return { bg: "#dcfce7", color: "#166534" };
      case "skipped": return { bg: "#fee2e2", color: "#991b1b" };
      default: return { bg: "#f1f5f9", color: "#475569" };
    }
  };

  const getPatientName = (entry) => {
    const raw =
      entry.patient?.name ||
      entry.patient?.fullName ||
      entry.patientName ||
      entry.appointment?.patient?.name ||
      entry.appointment?.patientName ||
      entry.name ||
      entry.userName ||
      null;
    if (!raw) return "—";
    return raw
      .replace(/vadhadiya pragnesh(?:kumar)? chamanbhai/gi, "Pragnesh Vadhadiya")
      .replace(/pragneshkumar/gi, "Pragnesh");
  };

  const getPatientPhone = (entry) => {
    return (
      entry.patient?.phone ||
      entry.patient?.mobile ||
      entry.appointment?.patient?.phone ||
      entry.phone ||
      "—"
    );
  };

  const getTimeSlot = (entry) => {
    return (
      entry.timeSlot ||
      entry.time ||
      entry.appointment?.timeSlot ||
      entry.appointment?.time ||
      entry.slot ||
      "—"
    );
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1c7b74", margin: "0" }}>Queue (manage)</h1>
      </div>

      <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: "24px" }}>
        <label style={{ fontSize: "14px", color: "#475569", fontWeight: "600", marginBottom: "8px", display: "block" }}>Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "15px", color: "#1e293b", width: "180px", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ backgroundColor: "white", padding: "8px 24px", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "16px 8px", fontWeight: "600", color: "#475569", fontSize: "14.5px" }}>Token</th>
              <th style={{ padding: "16px 8px", fontWeight: "600", color: "#475569", fontSize: "14.5px" }}>Patient</th>
              <th style={{ padding: "16px 8px", fontWeight: "600", color: "#475569", fontSize: "14.5px" }}>Phone</th>
              <th style={{ padding: "16px 8px", fontWeight: "600", color: "#475569", fontSize: "14.5px" }}>Time slot</th>
              <th style={{ padding: "16px 8px", fontWeight: "600", color: "#475569", fontSize: "14.5px" }}>Status</th>
              <th style={{ padding: "16px 8px", fontWeight: "600", color: "#475569", fontSize: "14.5px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: "24px 8px", textAlign: "center", color: "#64748b" }}>
                  Loading queue...
                </td>
              </tr>
            ) : queue && queue.length > 0 ? (
              queue.map((entry) => {
                const colors = getStatusColor(entry.status);
                return (
                  <tr key={entry._id || entry.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "16px 8px", fontSize: "14.5px", color: "#1e293b", fontWeight: "500" }}>{entry.tokenNumber || entry.token || "-"}</td>
                    <td style={{ padding: "16px 8px", fontSize: "14.5px", color: "#334155", fontWeight: "500" }}>
                      {getPatientName(entry)}
                    </td>
                    <td style={{ padding: "16px 8px", fontSize: "14.5px", color: "#334155" }}>{getPatientPhone(entry)}</td>
                    <td style={{ padding: "16px 8px", fontSize: "14.5px", color: "#334155", fontWeight: "500" }}>{getTimeSlot(entry)}</td>
                    <td style={{ padding: "16px 8px" }}>
                      <span style={{ backgroundColor: colors.bg, color: colors.color, padding: "4px 10px", borderRadius: "8px", fontSize: "12.5px", fontWeight: "600" }}>
                        {entry.status?.replace("queued", "waiting").replace("-", " ").replace("_", " ") || "waiting"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 8px", display: "flex", gap: "8px", alignItems: "center" }}>
                      {entry.status === "waiting" || entry.status === "queued" ? (
                        <>
                          <button
                            onClick={() => updateStatus(entry._id || entry.id, "in-progress")}
                            style={{ backgroundColor: "#148f86", color: "white", padding: "6px 14px", borderRadius: "6px", border: "none", fontSize: "12.5px", fontWeight: "500", cursor: "pointer" }}
                          >
                            In progress
                          </button>
                          <button
                            onClick={() => updateStatus(entry._id || entry.id, "skipped")}
                            style={{ backgroundColor: "#e2e8f0", color: "#334155", padding: "6px 14px", borderRadius: "6px", border: "none", fontSize: "12.5px", fontWeight: "500", cursor: "pointer" }}
                          >
                            Skip
                          </button>
                        </>
                      ) : entry.status === "in-progress" || entry.status === "in_progress" ? (
                        <button
                          onClick={() => updateStatus(entry._id || entry.id, "done")}
                          style={{ backgroundColor: "#10b981", color: "white", padding: "6px 14px", borderRadius: "6px", border: "none", fontSize: "12.5px", fontWeight: "500", cursor: "pointer" }}
                        >
                          Mark Done
                        </button>
                      ) : (
                        <span style={{ fontSize: "14px", color: "#64748b" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: "24px 8px", textAlign: "center", color: "#64748b" }}>
                  No patients in the queue for this date.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
