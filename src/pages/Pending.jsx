import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRider } from '../context/RiderContext';
import MayonMark from '../components/MayonMark';
import BanigBand from '../components/BanigBand';

const NEXT_STEPS = [
  'We check your documents.',
  'You attend a short rider orientation.',
  'You go online and start earning.',
];

const CONTACT_EMAIL = 'jlaabdevstudio@gmail.com';

export default function Pending() {
  const { session, loading, profile, logout } = useAuth();
  const { rider, riderLoading, reloadRider } = useRider();

  if (loading || riderLoading) return <p className="page-loading">Loading...</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (!rider) return <Navigate to="/register" replace />;
  if (rider.status === 'approved') return <Navigate to="/" replace />;

  const firstName = (profile?.full_name || 'rider').split(' ')[0];
  const content = {
    pending: {
      title: `Dios mabalos, ${firstName}!`,
      text: "Your application is being reviewed. This usually takes 1 to 2 days. We'll contact you once you're approved.",
    },
    rejected: {
      title: "We couldn't approve your application yet",
      text: rider.status_note || 'Please contact us so we can help you complete it.',
    },
    suspended: {
      title: 'Your rider account is paused',
      text: rider.status_note || 'Please contact us for details.',
    },
  }[rider.status];

  return (
    <div className="register">
      <div className="page page-narrow">
        <div className="pending-art">
          <MayonMark />
        </div>
        <h1 className="page-title">{content.title}</h1>
        <p className="muted">{content.text}</p>

        <div className="bleed pending-band">
          <BanigBand id="pending-band" height={10} />
        </div>

        <div className="panel">
          <div className="detail-row">
            <span>Service area</span>
            <span>{rider.town}</span>
          </div>
          <div className="detail-row">
            <span>Vehicle</span>
            <span>
              {rider.vehicle}
              {rider.plate ? `, ${rider.plate}` : ''}
            </span>
          </div>
          <div className="detail-row">
            <span>Documents</span>
            <span>{(rider.rider_documents ?? []).length} photos submitted</span>
          </div>
        </div>

        {rider.status === 'pending' && (
          <>
            <h2 className="section-title">What happens next</h2>
            <ol className="install-steps">
              {NEXT_STEPS.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ol>
          </>
        )}

        <p className="small contact-line">
          Questions? Email{' '}
          <a className="link" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </p>

        <button type="button" className="demo-btn" onClick={reloadRider}>
          Check my status again
        </button>
        <button type="button" className="link-btn center logout-link" onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  );
}