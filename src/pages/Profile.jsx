import { Link } from 'react-router-dom';
import { ShieldCheck, Smartphone, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRider } from '../context/RiderContext';
import { initialsOf } from '../utils/format';
import BanigBand from '../components/BanigBand';

const showPhone = (phone) => (phone?.startsWith('+63') ? `0${phone.slice(3)}` : phone || 'Not provided');

export default function Profile() {
  const { session, profile, logout } = useAuth();
  const { rider, history } = useRider();
  const name = profile?.full_name || 'Rider';

  const details = [
    { key: 'Mobile', value: showPhone(profile?.phone) },
    { key: 'Service area', value: rider.town },
    { key: 'Vehicle', value: `${rider.vehicle}${rider.plate ? `, ${rider.plate}` : ''}` },
    { key: 'Documents', value: 'Verified' },
    { key: 'Completed deliveries', value: String(history.length) },
  ];

  const onLogout = () => {
    if (window.confirm("Log out? You'll need a new email code to log back in.")) logout();
  };

  return (
    <div className="page page-narrow">
      <section className="profile-hero">
        <div className="avatar avatar-pili">{initialsOf(name)}</div>
        <h1 className="profile-name">{name}</h1>
        <p className="muted">{session?.user.email}</p>
        <span className="badge">
          <ShieldCheck size={14} aria-hidden="true" />
          Approved rider
        </span>
      </section>
      <div className="profile-band">
        <BanigBand id="rider-profile-band" height={10} />
      </div>

      <div className="panel details">
        {details.map((d) => (
          <div key={d.key} className="detail-row">
            <span>{d.key}</span>
            <span>{d.value}</span>
          </div>
        ))}
      </div>

      <ul className="menu-list">
        <li>
          <Link to="/install" className="menu-row">
            <Smartphone size={20} aria-hidden="true" />
            <span>Add HatodNa Rider to your phone</span>
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        </li>
        <li>
          <button type="button" className="menu-row danger" onClick={onLogout}>
            <LogOut size={20} aria-hidden="true" />
            <span>Log out</span>
          </button>
        </li>
      </ul>
    </div>
  );
}