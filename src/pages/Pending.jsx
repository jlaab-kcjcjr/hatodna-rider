import { Link, Navigate } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRider } from '../context/RiderContext';
import MayonMark from '../components/MayonMark';
import BanigBand from '../components/BanigBand';

const CONTACT_EMAIL = 'jlaabdevstudio@gmail.com';

const STEPS_PENDING = [
  'We check your documents.',
  'You attend a short rider orientation.',
  'We activate your account.',
  'You go online and start earning.',
];

const STEPS_ORIENTATION = [
  'Attend the orientation on the schedule above.',
  'Our team activates your account.',
  'You go online and start earning.',
];

const BRING = ['A valid government ID', 'Your vehicle documents (license and OR/CR, if you have a motor vehicle)', 'Your phone, with HatodNa Rider open'];

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
      text: "Your application is being reviewed. This usually takes 1 to 2 days. We'll email you once it's approved.",
    },
    orientation: {
      title: `You're approved, ${firstName}!`,
      text: 'One last step: attend a short rider orientation. After that, our team activates your account so you can start accepting deliveries.',
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

  const steps = rider.status === 'orientation' ? STEPS_ORIENTATION : STEPS_PENDING;

  return (
    <div className="register">
      <div className="page page-narrow">
        <div className="pending-art">
          <MayonMark />
        </div>
        <h1 className="page-title">{content.title}</h1>
        <p className="muted">{content.text}</p>

        {rider.status === 'orientation' && (
          <section className="orientation-card">
            <p className="orientation-title">
              <CalendarCheck size={20} aria-hidden="true" />
              Your orientation
            </p>
            <p className="orientation-schedule">
              {rider.orientation_note || 'Our team will contact you with the schedule.'}
            </p>
            <p className="job-label">Please bring</p>
            <ul className="bring-list">
              {BRING.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

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

        {(rider.status === 'pending' || rider.status === 'orientation') && (
          <>
            <h2 className="section-title">What happens next</h2>
            <ol className="install-steps">
              {steps.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ol>
          </>
        )}

        {rider.status === 'rejected' && (
          <section className="resubmit-box">
            <h2 className="section-title">Ready to try again?</h2>
            <p className="muted">
              Fix what our team asked for, update your documents if needed, and send your application back for review.
            </p>
            <Link to="/resubmit" className="btn btn-primary btn-block resubmit-btn">
              Fix and resubmit
            </Link>
          </section>
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