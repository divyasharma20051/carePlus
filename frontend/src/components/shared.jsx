
import React, { useCallback, useEffect, useState } from 'react';
import {
  Link,
  NavLink,
  Navigate,
  useLocation,
} from 'react-router-dom';
import {
  ArrowRight,
  HeartPulse,
  Menu,
  X,
  LogOut,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import api from '../api';

export const locations = [
  'West Delhi',
  'Sec 47, Gurugram',
  'Sec 37D, Gurugram',
  'Palam Vihar, Gurugram',
  'Faridabad',
  'Sonipat',
  'Panipat',
  'Karnal',
  'Ambala',
  'Behror',
  'Jaipur',
  'Patiala',
  'Mohali',
  'Hodal',
];

export const specialties = [
  'Cardiology',
  'Oncology',
  'Dermatology',
  'Pediatrics',
  'General Physician',
  'Orthopedics',
  'Neurology',
];

// Authentication
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, setUser, loading, refresh };
}

// Protected routes
function ProtectedRoute({ user, children, roles }) {
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Role-based navigation
function Shell({ user, onLogout, children }) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  // Admin navbar
  const adminLinks = [
    { to: '/admin', label: 'Admin Dashboard' },
  ];

  // Doctor navbar
  const doctorLinks = [
    { to: '/doctor', label: 'Doctor Dashboard' },
    { to: '/appointments', label: 'Appointments' },
  ];

  // Patient and public navbar
  const patientLinks = [
    { to: '/wellness', label: 'Our Hospitals' },
    { to: '/doctors', label: 'Find Doctors' },
    { to: '/appointments', label: 'Appointments' },
    { to: '/packages', label: 'Health Packages' },
    { to: '/career', label: 'Careers' },
  ];

  const navItems =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'doctor'
      ? doctorLinks
      : patientLinks;

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'doctor'
      ? '/doctor'
      : '/dashboard';

  return (
    <div className="app-shell">
      <header className="navbar">
        {/* Brand */}
        <Link className="brand" to="/">
          <span className="brand-icon">
            <HeartPulse size={22} />
          </span>
          <span>
            CarePlus
            <small>HOSPITAL</small>
          </span>
        </Link>

        {/* Mobile menu button */}
        <button
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>

        {/* Role-specific navigation */}
        <nav className={open ? 'nav-links open' : 'nav-links'}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User actions */}
        <div className="nav-actions">
          {user ? (
            <>
              <Link
                className="user-pill"
                to={dashboardPath}
              >
                <span className="user-avatar">
                  {user.name?.slice(0, 1).toUpperCase()}
                </span>
                <span>
                  {user.name?.split(' ')[0]}
                </span>
              </Link>

              <button
                className="icon-btn"
                title="Log out"
                onClick={onLogout}
              >
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <Link className="login-link" to="/login">
                Log in
              </Link>

              <Link className="btn btn-sm" to="/register">
                Get started <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Page content */}
      {children}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-main">
          <Link className="brand" to="/">
            <span className="brand-icon">
              <HeartPulse size={22} />
            </span>
            <span>
              CarePlus
              <small>HOSPITAL</small>
            </span>
          </Link>

          <p>
            Every life matters. Compassionate care,
            trusted expertise, and better health for
            every family.
          </p>
        </div>

        <div>
          <b>Explore</b>
          <Link to="/doctors">Find a doctor</Link>
          <Link to="/appointments">Book appointment</Link>
          <Link to="/packages">Health packages</Link>
        </div>

        <div>
          <b>Contact</b>
          <span>
            <Phone size={14} /> 7503141435
          </span>
          <span>
            <Mail size={14} /> care@careplus.example
          </span>
          <span>
            <MapPin size={14} /> North India
          </span>
        </div>

        <div className="copyright">
          © {new Date().getFullYear()} CarePlus Hospital.
          All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// Alert component
function Alert({ message, type = 'error', onClose }) {
  if (!message) return null;

  return (
    <div className={'alert ' + type}>
      <AlertCircle size={17} />
      <span>{message}</span>

      {onClose && (
        <button onClick={onClose}>
          <X size={15} />
        </button>
      )}
    </div>
  );
}

// Redirect already logged-in users
function NavigateHome({ user }) {
  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'doctor'
      ? '/doctor'
      : '/dashboard';

  return (
    <main className="page center">
      <CheckCircle2 />

      <h2>You're already signed in.</h2>

      <Link className="btn" to={dashboardPath}>
        Open dashboard <ArrowRight size={16} />
      </Link>
    </main>
  );
}

// Access redirect
function AccessRedirect() {
  return (
    <main className="page center">
      <ShieldCheck size={38} />

      <h2>Sign in to view this dashboard</h2>

      <p className="muted">
        Use the account that matches this dashboard's role.
      </p>

      <Link className="btn" to="/login">
        Go to login <ArrowRight size={16} />
      </Link>
    </main>
  );
}

export {
  useAuth,
  ProtectedRoute,
  Shell,
  Alert,
  NavigateHome,
  AccessRedirect,
};
