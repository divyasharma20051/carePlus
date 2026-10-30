import { React, useCallback, useEffect, useState, Link, useNavigate, useLocation, Formik, Form, Field, Yup, api, getError, locations, specialties, Alert, Activity, ArrowRight, CalendarDays, CheckCircle2, Clock3, HeartPulse, Hospital, MapPin, Menu, Phone, Search, ShieldCheck, Stethoscope, Users, TrendingUp, X, LogIn, UserPlus, LogOut, LayoutDashboard, ClipboardList, BadgeCheck, Trash2, Star, ChevronRight, Mail, BriefcaseMedical, Sparkles, AlertCircle } from '../lib/pageImports';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;

    setLoading(true);
    setMsg('');

    api
      .get('/doctors', { params: { search } })
      .then((r) => {
        if (live) setDoctors(r.data.doctors || []);
      })
      .catch((e) => {
        if (live) setMsg(getError(e));
      })
      .finally(() => {
        if (live) setLoading(false);
      });

    return () => {
      live = false;
    };
  }, [search]);

  return (
    <main className="page">
      <div className="page-title">
        <span className="eyebrow">OUR MEDICAL TEAM</span>
        <h1>
          Find the right <em>doctor.</em>
        </h1>
        <p>
          Connect with our specialists and plan your next visit.
        </p>
      </div>

      <div className="search-bar">
        <Search />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search doctor or specialty…"
        />
      </div>

      {msg && <Alert message={msg} />}

      {loading ? (
        <p className="center muted">Loading doctors…</p>
      ) : doctors.length > 0 ? (
        <div className="doctor-grid">
          {doctors.map((d) => (
            <article className="doctor-card" key={d._id}>
              <div className="doctor-top">
                <div className="doctor-avatar">
                  {d.image ? (
                    <img
                      src={d.image}
                      alt={d.name}
                      className="doctor-photo"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('.doctor-avatar-fallback');
                        if (fallback) fallback.style.display = 'block';
                      }}
                    />
                  ) : (
                    <Stethoscope />
                  )}
                  {d.image && <span className="doctor-avatar-fallback" style={{ display: 'none' }}><Stethoscope /></span>}
                </div>

                <span className="verified">
                  <CheckCircle2 size={13} /> Verified
                </span>
              </div>

              <h3>
                Dr. {String(d.name || '').replace(/^Dr\.\s*/i, '')}
              </h3>

              <span className="doctor-specialty">
                {d.specialty || d.specialization || 'General Physician'}
              </span>

              <p>{d.experience || 0} years of clinical experience</p>

              {d.qualification && <p>{d.qualification}</p>}

              {d.consultationFee != null && (
                <p>Consultation fee: ₹{d.consultationFee}</p>
              )}

              <div className="doctor-card-bottom">
                <span>
                  <BadgeCheck size={15} /> CarePlus specialist
                </span>
                <Link className="btn btn-sm" to="/appointments">
                  Book <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Stethoscope />
          <h3>No doctors found</h3>
          <p>
            Doctors could not be found. Check the backend API or try another search.
          </p>
        </div>
      )}
    </main>
  );
}
