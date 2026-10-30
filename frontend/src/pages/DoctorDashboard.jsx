import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import { api, getError } from '../api';

import {
  Alert,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Search,
  X,
  ClipboardList,
  Activity,
  Eye,
  Filter,
  Phone,
  Mail,
  Stethoscope,
  CalendarCheck
} from '../lib/pageImports';

const STATUSES = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return 'Not specified';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not specified' : date.toLocaleDateString('en-IN', options);
}

export default function DoctorDashboard({ user }) {
  const [data, setData] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [savingId, setSavingId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/appointments/my');
      setData(Array.isArray(response.data.appointments) ? response.data.appointments : []);
      setMsg('');
    } catch (error) {
      setMsg(getError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => {
    const today = new Date();
    const isToday = (value) => {
      const d = new Date(value);
      return !Number.isNaN(d.getTime()) &&
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
    };
    return {
      total: data.length,
      today: data.filter(a => isToday(a.appointmentDate) && a.status !== 'Cancelled').length,
      pending: data.filter(a => a.status === 'Pending').length,
      confirmed: data.filter(a => a.status === 'Confirmed').length,
      completed: data.filter(a => a.status === 'Completed').length
    };
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter(a => {
      const matchesSearch = !q || [
        a.patientName, a.phone, a.reason, a.timeSlot, a.patient?.email
      ].some(v => String(v || '').toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
      const matchesDate = !dateFilter || (a.appointmentDate && new Date(a.appointmentDate).toISOString().slice(0, 10) === dateFilter);
      return matchesSearch && matchesStatus && matchesDate;
    }).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
  }, [data, search, statusFilter, dateFilter]);

  const update = async (id, status) => {
    setSavingId(id);
    setMsg('');
    try {
      const response = await api.patch(`/doctor/appointments/${id}`, { status });
      const updated = response.data.appointment;
      setData(prev => prev.map(a => a._id === id ? { ...a, ...(updated || {}), status } : a));
      setSelected(prev => prev?._id === id ? { ...prev, ...(updated || {}), status } : prev);
    } catch (error) {
      setMsg(getError(error));
    } finally {
      setSavingId('');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setDateFilter('');
  };

  return (
    <main className="page dashboard-page doctor-dashboard">
      <div className="dashboard-title">
        <div>
          <span className="eyebrow">DOCTOR PORTAL</span>
          <h1>Welcome, <em>Dr. {user?.name || 'Doctor'}.</em></h1>
          <p>Here’s your appointment overview. Review patient requests and manage your schedule.</p>
        </div>
        <button className="doctor-refresh-btn" type="button" onClick={load} disabled={loading}>
          <Activity size={16} /> {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {msg && <div className="doctor-dashboard-alert"><Alert message={msg} /></div>}

      <section className="doctor-stats-grid" aria-label="Appointment overview">
        <div className="doctor-stat-card">
          <span className="doctor-stat-icon"><CalendarDays /></span>
          <div><small>Today's appointments</small><strong>{counts.today}</strong><span>Scheduled for today</span></div>
        </div>
        <div className="doctor-stat-card">
          <span className="doctor-stat-icon amber"><Clock3 /></span>
          <div><small>Pending requests</small><strong>{counts.pending}</strong><span>Need your attention</span></div>
        </div>
        <div className="doctor-stat-card">
          <span className="doctor-stat-icon blue"><CalendarCheck /></span>
          <div><small>Confirmed</small><strong>{counts.confirmed}</strong><span>Upcoming consultations</span></div>
        </div>
        <div className="doctor-stat-card">
          <span className="doctor-stat-icon green"><CheckCircle2 /></span>
          <div><small>Completed</small><strong>{counts.completed}</strong><span>Consultations finished</span></div>
        </div>
      </section>

      <section className="table-card doctor-appointments-card">
        <div className="table-heading doctor-appointments-heading">
          <div>
            <h2>Assigned appointments</h2>
            <p>{filtered.length} of {counts.total} appointment{counts.total === 1 ? '' : 's'} · Requests assigned to your account</p>
          </div>
          <span className="doctor-total-pill"><ClipboardList size={15} /> {counts.total} total</span>
        </div>

        <div className="doctor-filters">
          <label className="doctor-search-field">
            <Search size={17} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient, phone or reason…" aria-label="Search appointments" />
          </label>
          <label className="doctor-filter-field">
            <Filter size={15} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filter by status">
              {STATUSES.map(status => <option key={status} value={status}>{status === 'All' ? 'All statuses' : status}</option>)}
            </select>
          </label>
          <label className="doctor-date-field">
            <CalendarDays size={15} />
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} aria-label="Filter by appointment date" />
          </label>
          {(search || statusFilter !== 'All' || dateFilter) && (
            <button className="doctor-clear-filters" type="button" onClick={clearFilters}>Clear</button>
          )}
        </div>

        {loading ? (
          <div className="doctor-loading-state"><span className="doctor-loader" /> Loading appointments…</div>
        ) : filtered.length ? (
          <div className="appointment-list doctor-appointment-list">
            {filtered.map(a => (
              <article className="appointment-row doctor-appointment-row" key={a._id}>
                <div className="appointment-date">
                  <b>{new Date(a.appointmentDate).getDate()}</b>
                  <small>{new Date(a.appointmentDate).toLocaleString('en', { month: 'short' })}</small>
                </div>
                <div className="appointment-details">
                  <b>{a.patientName || a.patient?.name || 'Patient'}</b>
                  <span>{a.timeSlot || 'Time not specified'} · {formatDate(a.appointmentDate, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  <small>{a.reason || 'No reason provided'}{a.phone ? ` · ${a.phone}` : ''}</small>
                </div>
                <span className={`status status-${String(a.status || 'Pending').toLowerCase()}`}>{a.status || 'Pending'}</span>
                <button className="doctor-view-btn" type="button" onClick={() => setSelected(a)} aria-label={`View ${a.patientName || 'patient'} appointment details`}>
                  <Eye size={15} /> <span>Details</span>
                </button>
                <select
                  className="status-select"
                  value={a.status || 'Pending'}
                  disabled={savingId === a._id}
                  onChange={e => update(a._id, e.target.value)}
                  aria-label={`Update appointment status for ${a.patientName || 'patient'}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state doctor-empty-state">
            <CalendarDays />
            <h3>{data.length ? 'No appointments match your filters' : 'No assigned appointments'}</h3>
            <p>{data.length ? 'Try changing the search or filters to see more appointments.' : 'New appointment requests assigned to your account will appear here.'}</p>
            {data.length > 0 && <button type="button" className="doctor-clear-filters" onClick={clearFilters}>Clear filters</button>}
          </div>
        )}
      </section>

      {selected && (
        <div className="doctor-modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <section className="doctor-details-modal" role="dialog" aria-modal="true" aria-labelledby="doctor-modal-title">
            <div className="doctor-modal-header">
              <div><span className="eyebrow">APPOINTMENT DETAILS</span><h2 id="doctor-modal-title">{selected.patientName || selected.patient?.name || 'Patient'}</h2></div>
              <button type="button" className="doctor-modal-close" onClick={() => setSelected(null)} aria-label="Close details"><X /></button>
            </div>
            <div className="doctor-modal-statusline">
              <span className={`status status-${String(selected.status || 'Pending').toLowerCase()}`}>{selected.status || 'Pending'}</span>
              <span>Appointment ID: {String(selected._id || '').slice(-8).toUpperCase()}</span>
            </div>
            <div className="doctor-detail-grid">
              <div><CalendarDays /><small>Date</small><b>{formatDate(selected.appointmentDate)}</b></div>
              <div><Clock3 /><small>Time slot</small><b>{selected.timeSlot || 'Not specified'}</b></div>
              <div><Phone /><small>Contact number</small><b>{selected.phone || 'Not provided'}</b></div>
              <div><Mail /><small>Patient email</small><b>{selected.patient?.email || 'Not available'}</b></div>
              <div className="doctor-detail-wide"><Stethoscope /><small>Reason for visit</small><b>{selected.reason || 'No reason provided'}</b></div>
            </div>
            <div className="doctor-modal-actions">
              <button type="button" className="doctor-modal-secondary" onClick={() => setSelected(null)}>Close</button>
              {selected.status !== 'Cancelled' && selected.status !== 'Completed' && (
                <button type="button" className="doctor-modal-primary" disabled={savingId === selected._id} onClick={async () => { await update(selected._id, selected.status === 'Pending' ? 'Confirmed' : 'Completed'); }}>
                  {savingId === selected._id ? 'Saving…' : selected.status === 'Pending' ? 'Confirm appointment' : 'Mark completed'}
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
