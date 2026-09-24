import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get("/appointments/mine")
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function cancelAppointment(id) {
    if (!window.confirm("Cancel this appointment?")) return;
    await api.delete(`/appointments/${id}`);
    load();
  }

  const grouped = appointments.reduce((acc, appt) => {
    acc[appt.date] = acc[appt.date] || [];
    acc[appt.date].push(appt);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Your schedule</div>
        <h1>My appointments</h1>
      </div>

      {loading && <p className="loading-text">Loading your appointments…</p>}

      {!loading && appointments.length === 0 && (
        <div className="empty-state">
          <h3>Nothing booked yet</h3>
          <p>When you book a visit, it'll show up here.</p>
          <Link to="/doctors" className="btn btn-primary" style={{ marginTop: 14 }}>
            Find a doctor
          </Link>
        </div>
      )}

      {Object.keys(grouped).map((date) => (
        <div className="ledger-date-group" key={date}>
          <div className="ledger-date-heading">
            <span className="date-main">{date}</span>
            <span className="date-count">
              {grouped[date].length} appointment{grouped[date].length > 1 ? "s" : ""}
            </span>
          </div>

          {grouped[date].map((appt) => (
            <div className="ledger-entry" key={appt._id}>
              <div className="ledger-time">{appt.time}</div>
              <div className="ledger-who">
                <div className="name">{appt.doctor?.user?.name}</div>
                <div className="reason">{appt.doctor?.specialization}</div>
                {appt.reason && <div className="reason">Reason: {appt.reason}</div>}
              </div>
              <span className={`status-tag status-${appt.status}`}>{appt.status}</span>
              {(appt.status === "pending" || appt.status === "confirmed") && (
                <div className="ledger-actions">
                  <button className="btn btn-danger btn-sm" onClick={() => cancelAppointment(appt._id)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
