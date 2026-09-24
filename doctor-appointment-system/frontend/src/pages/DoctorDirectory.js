import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";

export default function DoctorDirectory() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSpecialization = searchParams.get("specialization") || "";

  useEffect(() => {
    setLoading(true);
    api
      .get("/doctors", { params: activeSpecialization ? { specialization: activeSpecialization } : {} })
      .then((res) => setDoctors(res.data))
      .finally(() => setLoading(false));
  }, [activeSpecialization]);

  const specializations = useMemo(() => {
    return ["All", ...new Set(doctors.map((d) => d.specialization))];
  }, [doctors]);

  function selectSpecialization(spec) {
    if (spec === "All") {
      searchParams.delete("specialization");
    } else {
      searchParams.set("specialization", spec);
    }
    setSearchParams(searchParams);
  }

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Directory</div>
        <h1>Find a doctor</h1>
      </div>

      {!loading && specializations.length > 1 && (
        <div className="filter-row">
          {specializations.map((spec) => (
            <button
              key={spec}
              className={`filter-chip ${
                (spec === "All" && !activeSpecialization) || spec === activeSpecialization ? "active" : ""
              }`}
              onClick={() => selectSpecialization(spec)}
            >
              {spec}
            </button>
          ))}
        </div>
      )}

      {loading && <p className="loading-text">Loading doctors…</p>}

      {!loading && doctors.length === 0 && (
        <div className="empty-state">
          <h3>No doctors here yet</h3>
          <p>Try a different specialization, or check back once more doctors have registered.</p>
        </div>
      )}

      {!loading &&
        doctors.map((doc) => (
          <div className="doctor-row" key={doc._id}>
            <div className="doctor-identity">
              <h3>{doc.user?.name}</h3>
              <div className="doctor-specialization">{doc.specialization}</div>
              <div className="doctor-meta">
                {doc.qualification && <span>{doc.qualification}</span>}
                {!!doc.experienceYears && <span>{doc.experienceYears} yrs experience</span>}
                {doc.clinicAddress && <span>{doc.clinicAddress}</span>}
              </div>
              {doc.bio && <p className="doctor-bio">{doc.bio}</p>}
            </div>
            <div className="doctor-fee">
              {!!doc.consultationFee && <span className="amount">₹{doc.consultationFee}</span>}
              <Link to={`/doctors/${doc._id}`} className="btn btn-primary btn-sm">
                View slots
              </Link>
            </div>
          </div>
        ))}
    </div>
  );
}
