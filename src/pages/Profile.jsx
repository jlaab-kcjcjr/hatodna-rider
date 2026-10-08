import { Link } from 'react-router-dom';
import { ShieldCheck, Smartphone, CircleHelp, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { initialsOf } from '../utils/format';
import BanigBand from '../components/BanigBand';

export default function Profile() {
  const { user, application, history, logout } = useAuth();

  const details = [
    { key: 'Service area', value: application.town },
    { key: 'Vehicle', value: `${application.vehicle}${application.plate ? `, ${application.plate}` : ''}` },
    { key: 'Documents', value: 'Verified' },
    { key: 'Total deliveries', value: String(history.length) },
  ];

  const onLogout = () => {
    if (window.confirm("Log out? You'll go offline and need to verify your number again.")) logout();
  };

  return (
    <div className="page page-narrow">
      <section className="profile-hero">
        <div className="avatar avatar-pili">{initialsOf(application.name)}</div>
        <h1 className="profile-name">{application.name}</h1>
        <p className="muted">{user.phone}</p>
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
          <button
            type="button"
            className="menu-row"
            onClick={() => window.alert('Help and support is coming in the next update.')}
          >
            <CircleHelp size={20} aria-hidden="true" />
            <span>Help and support</span>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
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