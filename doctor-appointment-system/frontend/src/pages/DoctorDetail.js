import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function DoctorDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .get(`/doctors/${id}`)
      .then((res) => setDoctor(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  function pickSlot(date, time) {
    setSelectedDate(date);
    setSelectedTime(time);
    setError("");
  }

  async function handleBook() {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "patient") {
      setError("Only patient accounts can book appointments");
      return;
    }
    setBooking(true);
    setError("");
    try {
      await api.post("/appointments", {
        doctorId: id,
        date: selectedDate,
        time: selectedTime,
        reason,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not book that slot");
    } finally {
      setBooking(false);
    }
  }

  if (loading) return <p className="loading-text">Loading doctor's schedule…</p>;
  if (!doctor) return <p>Doctor not found.</p>;

  if (success) {
    return (
      <div className="panel panel-narrow">
        <h1 style={{ fontSize: 22 }}>You're booked</h1>
        <p>
          {selectedDate} at {selectedTime} with {doctor.user?.name}. You'll see this in your
          appointments list.
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/my-appointments")}>
          View my appointments
        </button>
      </div>
    );
  }

  const upcomingDays = (doctor.availability || []).filter((d) => d.slots.some((s) => true));

  return (
    <div className="two-col">
      <div>
        <div className="page-head">
          <div className="eyebrow">{doctor.specialization}</div>
          <h1>{doctor.user?.name}</h1>
          <p style={{ marginTop: 8 }}>
            {doctor.qualification}
            {doctor.experienceYears ? ` · ${doctor.experienceYears} years experience` : ""}
          </p>
          {doctor.clinicAddress && <p>{doctor.clinicAddress}</p>}
          {doctor.bio && <p>{doctor.bio}</p>}
        </div>

        <h2 className="section-title">Choose a time</h2>

        {upcomingDays.length === 0 && (
          <div className="empty-state">
            <h3>No open slots right now</h3>
            <p>This doctor hasn't published availability yet. Check back soon.</p>
          </div>
        )}

        {upcomingDays.map((day) => (
          <div className="slot-day" key={day._id}>
            <div className="slot-day-label">{day.date}</div>
            <div className="slot-grid">
              {day.slots.map((slot) => (
                <button
                  key={slot._id}
                  className={`slot-btn ${
                    selectedDate === day.date && selectedTime === slot.time ? "selected" : ""
                  }`}
                  disabled={slot.isBooked}
                  onClick={() => pickSlot(day.date, slot.time)}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="summary-box">
        <h4>Your visit</h4>
        <div className="summary-line">
          <span>Doctor</span>
          <span>{doctor.user?.name}</span>
        </div>
        <div className="summary-line">
          <span>Date</span>
          <span>{selectedDate || "—"}</span>
        </div>
        <div className="summary-line">
          <span>Time</span>
          <span>{selectedTime || "—"}</span>
        </div>
        {!!doctor.consultationFee && (
          <div className="summary-line">
            <span>Fee</span>
            <span>₹{doctor.consultationFee}</span>
          </div>
        )}

        <div className="field" style={{ marginTop: 14 }}>
          <label>Reason for visit (optional)</label>
          <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>

        {error && <div className="notice notice-error">{error}</div>}

        <button
          className="btn btn-primary btn-block"
          disabled={!selectedTime || booking}
          onClick={handleBook}
        >
          {booking ? "Booking…" : "Confirm appointment"}
        </button>
      </div>
    </div>
  );
}
