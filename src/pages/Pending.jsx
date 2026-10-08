import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MayonMark from '../components/MayonMark';
import BanigBand from '../components/BanigBand';

const NEXT_STEPS = [
  'We check your documents.',
  'You attend a short rider orientation.',
  'You go online and start earning.',
];

export default function Pending() {
  const { user, application, approveDemo, logout } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!application) return <Navigate to="/register" replace />;
  if (application.status === 'approved') return <Navigate to="/" replace />;

  const firstName = application.name.split(' ')[0];

  return (
    <div className="register">
      <div className="page page-narrow">
        <div className="pending-art">
          <MayonMark />
        </div>
        <h1 className="page-title">Dios mabalos, {firstName}!</h1>
        <p className="muted">
          Your application is being reviewed. This usually takes 1 to 2 days. We'll text you at {user.phone} once
          you're approved.
        </p>

        <div className="bleed pending-band">
          <BanigBand id="pending-band" height={10} />
        </div>

        <div className="panel">
          <div className="detail-row">
            <span>Service area</span>
            <span>{application.town}</span>
          </div>
          <div className="detail-row">
            <span>Vehicle</span>
            <span>
              {application.vehicle}
              {application.plate ? `, ${application.plate}` : ''}
            </span>
          </div>
          <div className="detail-row">
            <span>Documents</span>
            <span>{Object.keys(application.docs).length} photos submitted</span>
          </div>
        </div>

        <h2 className="section-title">What happens next</h2>
        <ol className="install-steps">
          {NEXT_STEPS.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ol>

        <button type="button" className="demo-btn" onClick={approveDemo}>
          Demo: approve my application
        </button>
        <button type="button" className="link-btn center logout-link" onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  );
}