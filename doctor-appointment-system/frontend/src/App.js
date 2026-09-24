import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Topbar from "./components/Topbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorDirectory from "./pages/DoctorDirectory";
import DoctorDetail from "./pages/DoctorDetail";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Topbar />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/doctors" element={<DoctorDirectory />} />
              <Route path="/doctors/:id" element={<DoctorDetail />} />
              <Route
                path="/my-appointments"
                element={
                  <ProtectedRoute role="patient">
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/dashboard"
                element={
                  <ProtectedRoute role="doctor">
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
