import { Link } from "react-router-dom";

const specializations = [
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Orthopedics",
  "Neurology",
  "General Physician",
];

export default function Home() {
  return (
    <div>
      <section className="hero">
        <div>
          <h1>Book a doctor's visit the way you'd write it in a diary.</h1>
          <p className="lede">
            Pick a doctor, see the open slots on their day sheet, and reserve one. No phone
            queues, no waiting for a callback — your appointment is confirmed the moment a slot
            is booked.
          </p>
          <div className="hero-actions">
            <Link to="/doctors" className="btn btn-primary">
              Find a doctor
            </Link>
            <Link to="/register" className="btn btn-ghost">
              Register as a doctor
            </Link>
          </div>
        </div>

        <div className="hero-figure">
          <div className="slip-title">Thursday, 25 September</div>
          <div className="slip-line">
            <span>10:00 AM</span>
            <span>Dr. Anjali Mehra — Cardiology</span>
          </div>
          <div className="slip-line">
            <span>10:30 AM</span>
            <span>Open</span>
          </div>
          <div className="slip-line">
            <span>11:00 AM</span>
            <span>Open</span>
          </div>
          <div className="slip-line">
            <span>4:00 PM</span>
            <span>Dr. Rohit Verma — Dermatology</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title">Browse by specialization</h2>
        <div className="specialization-grid">
          {specializations.map((spec) => (
            <Link key={spec} to={`/doctors?specialization=${encodeURIComponent(spec)}`} className="specialization-card">
              <span className="name">{spec}</span>
              <span className="count">View available doctors</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
