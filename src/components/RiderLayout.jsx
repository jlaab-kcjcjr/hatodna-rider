import { useEffect } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Bike, Wallet, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRider } from '../context/RiderContext';
import { useWakeLock } from '../utils/useWakeLock';
import { BRAND } from '../theme';

const TABS = [
  { to: '/', label: 'Jobs', Icon: Bike, end: true },
  { to: '/earnings', label: 'Earnings', Icon: Wallet },
  { to: '/profile', label: 'Profile', Icon: UserRound },
];

// Sends riders to the right step (login, sign-up, waiting for approval) before showing the tabs.
export default function RiderLayout() {
  const { session, loading } = useAuth();
  const { rider, riderLoading, activeJob } = useRider();
  const { pathname } = useLocation();

  useWakeLock(Boolean(rider?.is_online) || Boolean(activeJob));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (loading || riderLoading) return <p className="page-loading">Loading...</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (!rider) return <Navigate to="/register" replace />;
  if (rider.status !== 'approved') return <Navigate to="/pending" replace />;

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="topbar-brand">
          {BRAND.name}
          <span className="topbar-tag">Rider</span>
        </Link>
        <nav className="topnav" aria-label="Main">
          {TABS.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `topnav-link${isActive ? ' active' : ''}`}>
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="tabbar" aria-label="Main">
        {TABS.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `tab-link${isActive ? ' active' : ''}`}>
            <Icon size={22} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}