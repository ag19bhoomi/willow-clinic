import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "doctor" ? "/doctor/dashboard" : "/doctors");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong logging you in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="panel panel-narrow">
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Welcome back</h1>
      <p style={{ marginBottom: 24 }}>Log in to manage your appointments.</p>

      {error && <div className="notice notice-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p style={{ marginTop: 18, fontSize: 13.5 }}>
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
}
