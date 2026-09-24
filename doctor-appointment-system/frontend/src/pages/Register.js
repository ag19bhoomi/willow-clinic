import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    qualification: "",
    experienceYears: "",
    consultationFee: "",
    clinicAddress: "",
    bio: "",
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await register({ ...form, role });
      navigate(user.role === "doctor" ? "/doctor/dashboard" : "/doctors");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong creating your account");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="panel panel-narrow" style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Create an account</h1>
      <p style={{ marginBottom: 20 }}>Tell us whether you're booking visits or seeing patients.</p>

      <div className="role-toggle">
        <button type="button" className={role === "patient" ? "active" : ""} onClick={() => setRole("patient")}>
          I'm a patient
        </button>
        <button type="button" className={role === "doctor" ? "active" : ""} onClick={() => setRole("doctor")}>
          I'm a doctor
        </button>
      </div>

      {error && <div className="notice notice-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label>Full name</label>
            <input required value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </div>

        {role === "doctor" && (
          <>
            <div className="field-row">
              <div className="field">
                <label>Specialization</label>
                <input
                  required
                  placeholder="e.g. Cardiology"
                  value={form.specialization}
                  onChange={(e) => update("specialization", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Qualification</label>
                <input
                  placeholder="e.g. MBBS, MD"
                  value={form.qualification}
                  onChange={(e) => update("qualification", e.target.value)}
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Years of experience</label>
                <input
                  type="number"
                  min="0"
                  value={form.experienceYears}
                  onChange={(e) => update("experienceYears", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Consultation fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.consultationFee}
                  onChange={(e) => update("consultationFee", e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label>Clinic address</label>
              <input value={form.clinicAddress} onChange={(e) => update("clinicAddress", e.target.value)} />
            </div>

            <div className="field">
              <label>Short bio</label>
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
                placeholder="A line or two patients will see on your profile."
              />
            </div>
          </>
        )}

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p style={{ marginTop: 18, fontSize: 13.5 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
