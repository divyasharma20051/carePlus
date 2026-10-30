import { React, useCallback, useEffect, useState, Link, useNavigate, useLocation, Formik, Form, Field, Yup, api, getError, locations, specialties, Alert, Activity, ArrowRight, CalendarDays, CheckCircle2, Clock3, HeartPulse, Hospital, MapPin, Menu, Phone, Search, ShieldCheck, Stethoscope, Users, TrendingUp, X, LogIn, UserPlus, LogOut, LayoutDashboard, ClipboardList, BadgeCheck, Trash2, Star, ChevronRight, Mail, BriefcaseMedical, Sparkles, AlertCircle } from '../lib/pageImports';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('');
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api
      .get('/packages', { params: { search, category, gender } })
      .then((r) => {
        setPackages(r.data.packages);
        setMsg('');
      })
      .catch((e) => setMsg(getError(e)));
  }, [search, category, gender]);

  return (
    <main className="page">
      <div className="page-title">
        <span className="eyebrow">PREVENTIVE HEALTHCARE</span>
        <h1>
          Health packages for <em>you.</em>
        </h1>
        <p>
          Explore available health-check packages from the CarePlus database.
        </p>
      </div>

      <div className="filter-bar">
        <div className="search-bar">
          <Search />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search packages…"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All package types</option>
          {['Basic', 'Radiology', 'Arthritis', 'Cardiac', 'Diabetes', 'Full Body'].map(
            (x) => (
              <option key={x} value={x}>
                {x}
              </option>
            )
          )}
        </select>

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">All genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Both">Both</option>
        </select>
      </div>

      {msg && <Alert message={msg} />}

      {packages.length ? (
        <div className="package-grid">
          {packages.map((p) => (
            <article className="package-card" key={p._id}>
              {/* Package image */}
              {p.image && (
                <img
                  src={p.image}
                  alt={p.packageName || 'Health package'}
                  className="package-image"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}

              <span className="package-icon">
                <Activity />
              </span>

              <span className="package-category">
                {p.category || 'Health check'}
              </span>

              <h3>{p.packageName || 'Health Package'}</h3>

              <p>
                {p.tests?.length || 0} tests included ·{' '}
                {p.gender || 'All genders'}
              </p>

              <div className="package-price">
                ₹{Number(p.price || 0).toLocaleString('en-IN')}
              </div>

              <button
                className="btn btn-block"
                onClick={() => setSelected(p)}
              >
                View package details <ArrowRight size={15} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Activity />
          <h3>No packages found</h3>
          <p>
            Health packages are loaded from MongoDB. Add package records to
            the existing Package collection to display them here.
          </p>
        </div>
      )}

      {selected && (
        <div
          className="modal-backdrop"
          onClick={() => setSelected(null)}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelected(null)}
            >
              <X />
            </button>

            <span className="eyebrow">PACKAGE DETAILS</span>

            <h2>{selected.packageName}</h2>

            <p className="muted">
              {selected.category} · {selected.gender}
            </p>

            {selected.image && (
              <img
                src={selected.image}
                alt={selected.packageName || 'Health package'}
                className="package-image package-detail-image"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}

            <div className="package-price">
              ₹{Number(selected.price || 0).toLocaleString('en-IN')}
            </div>

            <h4>Tests included</h4>

            <ul className="test-list">
              {(selected.tests || []).map((t) => (
                <li key={t}>
                  <CheckCircle2 size={15} />
                  {t}
                </li>
              ))}
            </ul>

            <Link className="btn btn-block" to="/appointments">
              Request appointment <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
