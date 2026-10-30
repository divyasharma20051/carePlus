
import {
  React,
  useCallback,
  useEffect,
  useState,
  Link,
  api,
  getError,
  Alert,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Search,
  X,
  RefreshCw,
  ClipboardList,
} from '../lib/pageImports';

export default function Dashboard({ user }) {
  const [data, setData] = useState([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  // Load patient's appointments
  const load = useCallback(async () => {
    setMsg('');
    setLoading(true);

    try {
      const response = await api.get('/appointments/my');
      setData(response.data.appointments || []);
    } catch (error) {
      setMsg(getError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Cancel an appointment
  const cancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    setBusy(true);
    setMsg('');

    try {
      await api.patch(`/appointments/${id}/status`, {
        status: 'Cancelled',
      });

      await load();
      setMsg('Appointment cancelled successfully.');
    } catch (error) {
      setMsg(getError(error));
    } finally {
      setBusy(false);
    }
  };

  // Appointment statistics
  const pendingCount = data.filter(
    (a) => a.status === 'Pending'
  ).length;

  const confirmedCount = data.filter(
    (a) => a.status === 'Confirmed'
  ).length;

  const completedCount = data.filter(
    (a) => a.status === 'Completed'
  ).length;

  const cancelledCount = data.filter(
    (a) => a.status === 'Cancelled'
  ).length;

  const upcomingCount = data.filter((a) => {
    const date = new Date(a.appointmentDate);

    return (
      !Number.isNaN(date.getTime()) &&
      date >= new Date() &&
      ['Pending', 'Confirmed'].includes(a.status)
    );
  }).length;

  // Search and filter appointments
  const filteredData = data.filter((appointment) => {
    const doctorName =
      appointment.doctor?.name || 'CarePlus consultation';

    const query = search.toLowerCase();

    const matchesSearch = [
      doctorName,
      appointment.reason,
      appointment.timeSlot,
      appointment.status,
    ].some((value) =>
      String(value || '').toLowerCase().includes(query)
    );

    const matchesFilter =
      filter === 'All' || appointment.status === filter;

    return matchesSearch && matchesFilter;
  });

  // Format appointment date
  const formatDate = (dateValue) => {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return { day: '--', month: 'N/A', full: 'Date unavailable' };
    }

    return {
      day: date.getDate(),
      month: date.toLocaleString('en-IN', { month: 'short' }),
      full: date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };
  };

  return (
    <main className="page dashboard-page">
      {/* Dashboard heading */}
      <div className="dashboard-title">
        <div>
          <span className="eyebrow">PATIENT PORTAL</span>

          <h1>
            Welcome, <em>{user?.name?.split(' ')[0] || 'Patient'}.</em>
          </h1>

          <p>
            Manage your appointments and keep track of your healthcare.
          </p>
        </div>

        <div className="hero-actions">
          <button
            type="button"
            className="btn btn-light"
            onClick={load}
            disabled={loading || busy}
          >
            <span style={{ display: 'inline-flex', gap: 7, alignItems: 'center' }}>
              <RefreshCw size={16} />
              Refresh
            </span>
          </button>

          <Link className="btn" to="/appointments">
            New appointment <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <div className="dashboard-metrics">
        <div>
          <CalendarDays />
          <span>
            <b>{data.length}</b>
            <small>Total appointments</small>
          </span>
        </div>

        <div>
          <Clock3 />
          <span>
            <b>{pendingCount}</b>
            <small>Pending requests</small>
          </span>
        </div>

        <div>
          <CheckCircle2 />
          <span>
            <b>{confirmedCount}</b>
            <small>Confirmed visits</small>
          </span>
        </div>

        <div>
          <ClipboardList />
          <span>
            <b>{completedCount}</b>
            <small>Completed visits</small>
          </span>
        </div>

        <div>
          <CalendarDays />
          <span>
            <b>{upcomingCount}</b>
            <small>Upcoming appointments</small>
          </span>
        </div>
      </div>

      {/* Notifications */}
      {msg && (
        <div style={{ marginBottom: 16 }}>
          <Alert
            message={msg}
            type={
              msg.toLowerCase().includes('successfully')
                ? 'success'
                : 'error'
            }
            onClose={() => setMsg('')}
          />
        </div>
      )}

      {/* Appointments */}
      <div className="table-card">
        <div className="table-heading">
          <div>
            <h2>Your appointments</h2>
            <p>View and manage your appointment requests.</p>
          </div>
        </div>

        {/* Search and filter */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            padding: 20,
            borderBottom: '1px solid #e5eeee',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flex: '1 1 220px',
              border: '1px solid #dce7e7',
              borderRadius: 10,
              padding: '0 12px',
              background: '#fff',
            }}
          >
            <Search size={18} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search doctor, reason or status..."
              aria-label="Search appointments"
              style={{
                width: '100%',
                minWidth: 0,
                border: 0,
                outline: 0,
                padding: '12px 0',
                background: 'transparent',
              }}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                style={{
                  border: 0,
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter appointments by status"
            style={{
              minWidth: 170,
              border: '1px solid #dce7e7',
              borderRadius: 10,
              padding: '12px',
              background: '#fff',
            }}
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="empty-state">
            <Clock3 />
            <h3>Loading appointments...</h3>
            <p>Please wait while we retrieve your bookings.</p>
          </div>
        ) : data.length === 0 ? (
          /* Empty dashboard */
          <div className="empty-state">
            <CalendarDays />
            <h3>No appointments yet</h3>
            <p>
              Once you request a visit, it will appear here.
            </p>
            <Link className="btn" to="/appointments">
              Book an appointment <ArrowRight size={16} />
            </Link>
          </div>
        ) : filteredData.length === 0 ? (
          /* No search results */
          <div className="empty-state">
            <Search />
            <h3>No matching appointments</h3>
            <p>Try a different search or status filter.</p>

            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                setSearch('');
                setFilter('All');
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="appointment-list">
            {filteredData.map((appointment) => {
              const date = formatDate(appointment.appointmentDate);

              const doctorName = appointment.doctor?.name
                ? `Dr. ${appointment.doctor.name}`
                : 'CarePlus consultation';

              const statusClass = String(
                appointment.status || 'Pending'
              ).toLowerCase();

              const canCancel = [
                'Pending',
                'Confirmed',
              ].includes(appointment.status);

              return (
                <div
                  className="appointment-row"
                  key={appointment._id}
                >
                  {/* Date */}
                  <div className="appointment-date">
                    <b>{date.day}</b>
                    <small>{date.month}</small>
                  </div>

                  {/* Details */}
                  <div className="appointment-details">
                    <b>{doctorName}</b>
                    <span>
                      {appointment.timeSlot || 'Time not specified'}
                    </span>
                    <small>
                      {date.full}
                      {appointment.reason
                        ? ` · ${appointment.reason}`
                        : ''}
                    </small>
                  </div>

                  {/* Status */}
                  <span className={`status status-${statusClass}`}>
                    {appointment.status || 'Pending'}
                  </span>

                  {/* Cancel */}
                  {canCancel && (
                    <button
                      type="button"
                      className="cancel-link"
                      disabled={busy}
                      onClick={() => cancel(appointment._id)}
                    >
                      {busy ? 'Please wait...' : 'Cancel'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary footer */}
      {!loading && data.length > 0 && (
        <p
          className="muted"
          style={{ marginTop: 16, fontSize: 13 }}
        >
          Showing {filteredData.length} of {data.length} appointments.
          {' '}Cancelled appointments: {cancelledCount}.
        </p>
      )}
    </main>
  );
}
