import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">Willow Clinic</span>
          <span className="brand-sub">appointments</span>
        </Link>

        <nav className="topnav">
          <Link to="/doctors">Find a doctor</Link>

          {!user && (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}

          {user && user.role === "patient" && (
            <>
              <Link to="/my-appointments">My appointments</Link>
              <span className="pill">{user.name}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </>
          )}

          {user && user.role === "doctor" && (
            <>
              <Link to="/doctor/dashboard">Dashboard</Link>
              <span className="pill">Dr. {user.name}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
