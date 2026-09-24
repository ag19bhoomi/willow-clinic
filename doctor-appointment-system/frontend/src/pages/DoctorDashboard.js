import { useEffect, useState } from "react";
import api from "../api/axios";

export default function DoctorDashboard() {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [savingSlot, setSavingSlot] = useState(false);
  const [slotError, setSlotError] = useState("");

  function loadAll() {
    setLoading(true);
    Promise.all([api.get("/doctors/me/profile"), api.get("/appointments/mine")])
      .then(([profileRes, apptRes]) => {
        setProfile(profileRes.data);
        setAppointments(apptRes.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function addSlot(e) {
    e.preventDefault();
    if (!newDate || !newTime) return;
    setSavingSlot(true);
    setSlotError("");
    try {
      const { data } = await api.post("/doctors/me/availability", {
        date: newDate,
        slots: [newTime],
      });
      setProfile(data);
      setNewTime("");
    } catch (err) {
      setSlotError(err.response?.data?.message || "Could not add that slot");
    } finally {
      setSavingSlot(false);
    }
  }

  async function removeSlot(date, slotId) {
    const { data } = await api.delete(`/doctors/me/availability/${date}/${slotId}`);
    setProfile(data);
  }

  async function updateStatus(id, status) {
    await api.patch(`/appointments/${id}/status`, { status });
    loadAll();
  }

  if (loading) return <p className="loading-text">Loading your dashboard…</p>;

  const pendingAndConfirmed = appointments.filter((a) => a.status === "pending" || a.status === "confirmed");
  const past = appointments.filter((a) => a.status === "completed" || a.status === "cancelled");

  const groupedUpcoming = pendingAndConfirmed.reduce((acc, appt) => {
    acc[appt.date] = acc[appt.date] || [];
    acc[appt.date].push(appt);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Dr. {profile?.user?.name}</div>
        <h1>Your day sheet</h1>
      </div>

      <div className="two-col">
        <div>
          <h2 className="section-title">Upcoming appointments</h2>

          {pendingAndConfirmed.length === 0 && (
            <div className="empty-state">
              <h3>Nothing on the books</h3>
              <p>Once patients book your open slots, they'll appear here.</p>
            </div>
          )}

          {Object.keys(groupedUpcoming).map((date) => (
            <div className="ledger-date-group" key={date}>
              <div className="ledger-date-heading">
                <span className="date-main">{date}</span>
                <span className="date-count">{groupedUpcoming[date].length} booked</span>
              </div>

              {groupedUpcoming[date].map((appt) => (
                <div className="ledger-entry" key={appt._id}>
                  <div className="ledger-time">{appt.time}</div>
                  <div className="ledger-who">
                    <div className="name">{appt.patient?.name}</div>
                    {appt.reason && <div className="reason">{appt.reason}</div>}
                  </div>
                  <span className={`status-tag status-${appt.status}`}>{appt.status}</span>
                  <div className="ledger-actions">
                    {appt.status === "pending" && (
                      <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(appt._id, "confirmed")}>
                        Confirm
                      </button>
                    )}
                    {appt.status === "confirmed" && (
                      <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(appt._id, "completed")}>
                        Mark done
                      </button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => updateStatus(appt._id, "cancelled")}>
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {past.length > 0 && (
            <>
              <h2 className="section-title" style={{ marginTop: 30 }}>
                History
              </h2>
              {past.map((appt) => (
                <div className="ledger-entry" key={appt._id}>
                  <div className="ledger-time">
                    {appt.date} · {appt.time}
                  </div>
                  <div className="ledger-who">
                    <div className="name">{appt.patient?.name}</div>
                  </div>
                  <span className={`status-tag status-${appt.status}`}>{appt.status}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="summary-box">
          <h4>Add availability</h4>
          {slotError && <div className="notice notice-error">{slotError}</div>}
          <form onSubmit={addSlot}>
            <div className="field">
              <label>Date</label>
              <input type="date" required value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            </div>
            <div className="field">
              <label>Time</label>
              <input
                type="text"
                required
                placeholder="e.g. 10:30 AM"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
            <button className="btn btn-primary btn-block" disabled={savingSlot}>
              {savingSlot ? "Adding…" : "Add slot"}
            </button>
          </form>

          <h4 style={{ marginTop: 22 }}>Your open days</h4>
          {(profile?.availability || []).map((day) => (
            <div key={day._id} style={{ marginBottom: 14 }}>
              <div className="slot-day-label">{day.date}</div>
              <div className="slot-grid">
                {day.slots.map((slot) => (
                  <span
                    key={slot._id}
                    className={`slot-btn ${slot.isBooked ? "" : ""}`}
                    style={{ display: "flex", alignItems: "center", gap: 6, cursor: "default" }}
                  >
                    {slot.time}
                    {!slot.isBooked && (
                      <button
                        onClick={() => removeSlot(day.date, slot._id)}
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          color: "var(--ink-faint)",
                          fontSize: 13,
                        }}
                        title="Remove slot"
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
