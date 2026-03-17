"use client";

import { useState, useEffect } from "react";
import { api } from "../../services/api";

export default function DoctorDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [activeAppointmentId, setActiveAppointmentId] = useState(null);
  const [modalType, setModalType] = useState(null); // 'prescription' | 'report'

  const [prescriptionData, setPrescriptionData] = useState({
    notes: "",
    medicines: [{ name: "", dosage: "", duration: "", instructions: "" }]
  });

  const [reportData, setReportData] = useState({
    diagnosis: "",
    tests: [],
    remarks: ""
  });
  const [testInput, setTestInput] = useState("");

  const fetchQueue = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const data = await api.get("/doctor/queue", token);
      setQueue(data.queue || data);
    } catch (err) {
      setError(err.message || "Failed to load the queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const openModal = (appointmentId, type) => {
    setActiveAppointmentId(appointmentId);
    setModalType(type);
    setError("");
    setSuccess("");
    if (type === "prescription") {
      setPrescriptionData({ notes: "", medicines: [{ name: "", dosage: "", duration: "", instructions: "" }] });
    } else {
      setReportData({ diagnosis: "", tests: [], remarks: "" });
      setTestInput("");
    }
  };

  const handleAddMedicine = () => {
    setPrescriptionData({
      ...prescriptionData,
      medicines: [...prescriptionData.medicines, { name: "", dosage: "", duration: "", instructions: "" }]
    });
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...prescriptionData.medicines];
    newMedicines[index][field] = value;
    setPrescriptionData({ ...prescriptionData, medicines: newMedicines });
  };

  const handleRemoveMedicine = (index) => {
    const newMedicines = prescriptionData.medicines.filter((_, i) => i !== index);
    setPrescriptionData({ ...prescriptionData, medicines: newMedicines });
  };

  const handleAddTest = () => {
    if (testInput.trim() !== "") {
      setReportData({ ...reportData, tests: [...reportData.tests, testInput.trim()] });
      setTestInput("");
    }
  };

  const submitPrescription = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      await api.post(`/prescriptions/${activeAppointmentId}`, prescriptionData, token);
      setSuccess("Prescription added successfully!");
      setModalType(null);
    } catch (err) {
      setError(err.message || "Failed to save prescription.");
    }
  };

  const submitReport = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      await api.post(`/reports/${activeAppointmentId}`, reportData, token);
      setSuccess("Report added successfully!");
      setModalType(null);
    } catch (err) {
      setError(err.message || "Failed to save report.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting": return { bg: "#fef3c7", color: "#92400e" };
      case "in_progress": return { bg: "#dbeafe", color: "#1e40af" };
      case "done": return { bg: "#dcfce7", color: "#166534" };
      case "skipped": return { bg: "#fee2e2", color: "#991b1b" };
      default: return { bg: "#f1f5f9", color: "#475569" };
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1c7b74" }}>Today's Queue</h1>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="glass-card" style={{ padding: "0", overflow: "hidden", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "white", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "20px", fontWeight: "600", color: "#475569", width: "10%", fontSize: "14px" }}>Token</th>
              <th style={{ padding: "20px", fontWeight: "600", color: "#475569", width: "25%", fontSize: "14px" }}>Patient</th>
              <th style={{ padding: "20px", fontWeight: "600", color: "#475569", width: "15%", fontSize: "14px" }}>Status</th>
              <th style={{ padding: "20px", fontWeight: "600", color: "#475569", width: "25%", fontSize: "14px" }}>Appointment ID</th>
              <th style={{ padding: "20px", fontWeight: "600", color: "#475569", width: "25%", fontSize: "14px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                  Loading today's queue...
                </td>
              </tr>
            ) : queue && queue.length > 0 ? (
              queue.map((entry) => {
                const colors = getStatusColor(entry.status);
                const aptId = entry.appointmentId || entry.appointment?._id || entry.appointment?.id;
                return (
                  <tr key={entry._id || entry.id} style={{ borderBottom: "1px solid #f8fafc", backgroundColor: "white" }}>
                    <td style={{ padding: "20px", color: "#334155", fontWeight: "500", fontSize: "15px" }}>
                      {entry.tokenNumber || entry.token || "-"}
                    </td>
                    <td style={{ padding: "20px" }}>
                      <p style={{ fontWeight: "500", color: "#334155", fontSize: "15px" }}>
                        {(entry.patient?.name || entry.patientName || "Unknown Patient").replace(/vadhadiya pragnesh(?:kumar)? chamanbhai/gi, "Pragnesh Vadhadiya").replace(/pragneshkumar/gi, "Pragnesh")}
                      </p>
                    </td>
                    <td style={{ padding: "20px" }}>
                      <span style={{
                        padding: "4px 12px", borderRadius: "6px", fontSize: "13px",
                        fontWeight: "600", backgroundColor: "#fef3c7", color: "#92400e",
                        display: "inline-flex", alignItems: "center"
                      }}>
                        {entry.status.replace("_", " ").toLowerCase()}
                      </span>
                    </td>
                    <td style={{ padding: "20px", color: "#3b82f6", fontWeight: "500" }}>
                      {aptId}
                    </td>
                    <td style={{ padding: "20px" }}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <button
                          onClick={() => openModal(aptId, "prescription")}
                          style={{ padding: "8px 16px", fontSize: "13px", height: "auto", backgroundColor: "#148f86", color: "white", border: "none", borderRadius: "6px", fontWeight: "500", cursor: "pointer" }}
                        >
                          Add medicine
                        </button>
                        <button
                          onClick={() => openModal(aptId, "report")}
                          style={{ padding: "8px 16px", fontSize: "13px", height: "auto", backgroundColor: "#e2e8f0", color: "#334155", border: "none", borderRadius: "6px", fontWeight: "500", cursor: "pointer" }}
                        >
                          Add report
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                  Your queue is empty for today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PRESCRIPTION MODAL */}
      {modalType === "prescription" && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px"
        }}>
          <div className="glass-card" style={{ maxWidth: "700px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "600", color: "var(--primary)" }}>Add Prescription</h2>
              <button onClick={() => setModalType(null)} style={{ fontSize: "24px", color: "var(--text-muted)" }}>&times;</button>
            </div>
            <form onSubmit={submitPrescription}>
              <div className="input-group">
                <label>Doctor's Notes</label>
                <textarea
                  rows="3"
                  value={prescriptionData.notes}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, notes: e.target.value })}
                  style={{ width: "100%", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", resize: "vertical" }}
                ></textarea>
              </div>

              <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600" }}>Medicines</h3>
                <button type="button" onClick={handleAddMedicine} style={{ color: "var(--primary)", fontWeight: "500", fontSize: "14px" }}>
                  + Add Medicine
                </button>
              </div>

              {prescriptionData.medicines.map((med, index) => (
                <div key={index} style={{ padding: "16px", backgroundColor: "var(--background)", borderRadius: "8px", marginBottom: "16px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                    <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
                      <input required placeholder="Medicine Name" value={med.name} onChange={(e) => handleMedicineChange(index, "name", e.target.value)} />
                    </div>
                    <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                      <input required placeholder="Dosage (e.g. 1-0-1)" value={med.dosage} onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)} />
                    </div>
                    <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                      <input required placeholder="Duration (Days)" type="number" value={med.duration} onChange={(e) => handleMedicineChange(index, "duration", e.target.value)} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                      <input placeholder="Instructions (e.g. After meals)" value={med.instructions} onChange={(e) => handleMedicineChange(index, "instructions", e.target.value)} />
                    </div>
                    {prescriptionData.medicines.length > 1 && (
                      <button type="button" onClick={() => handleRemoveMedicine(index)} style={{ color: "var(--danger)", padding: "0 12px", fontWeight: "500" }}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                <button type="button" onClick={() => setModalType(null)} className="btn-primary" style={{ backgroundColor: "var(--background)", color: "var(--foreground)", border: "1px solid #cbd5e1" }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {modalType === "report" && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px"
        }}>
          <div className="glass-card" style={{ maxWidth: "600px", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "600", color: "var(--primary)" }}>Add Medical Report</h2>
              <button onClick={() => setModalType(null)} style={{ fontSize: "24px", color: "var(--text-muted)" }}>&times;</button>
            </div>
            <form onSubmit={submitReport}>
              <div className="input-group">
                <label>Diagnosis</label>
                <input required placeholder="Enter primary diagnosis..." value={reportData.diagnosis} onChange={(e) => setReportData({ ...reportData, diagnosis: e.target.value })} />
              </div>

              <div className="input-group">
                <label>Required Tests</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input placeholder="E.g. Full Blood Count" value={testInput} onChange={(e) => setTestInput(e.target.value)} />
                  <button type="button" onClick={handleAddTest} className="btn-primary" style={{ width: "auto" }}>Add</button>
                </div>
                {reportData.tests.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "12px", backgroundColor: "var(--background)", borderRadius: "8px" }}>
                    {reportData.tests.map((test, i) => (
                      <span key={i} style={{ padding: "4px 10px", backgroundColor: "#e0e7ff", color: "#3730a3", borderRadius: "100px", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
                        {test}
                        <button type="button" onClick={() => setReportData({ ...reportData, tests: reportData.tests.filter((_, idx) => idx !== i) })} style={{ color: "#3730a3", fontWeight: "bold" }}>&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="input-group">
                <label>Additional Remarks</label>
                <textarea
                  rows="3"
                  value={reportData.remarks}
                  onChange={(e) => setReportData({ ...reportData, remarks: e.target.value })}
                  style={{ width: "100%", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", resize: "vertical" }}
                ></textarea>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                <button type="button" onClick={() => setModalType(null)} className="btn-primary" style={{ backgroundColor: "var(--background)", color: "var(--foreground)", border: "1px solid #cbd5e1" }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
