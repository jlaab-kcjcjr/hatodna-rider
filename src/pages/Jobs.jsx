import { useEffect, useState } from 'react';
import { Store, MapPin, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme';
import { peso } from '../utils/format';
import { useNow } from '../utils/useNow';
import BanigBand from '../components/BanigBand';
import MayonMark from '../components/MayonMark';
import ActiveJob from '../components/ActiveJob';

const OFFER_SECONDS = 30;

function OfferCard({ offer, onAccept, onDecline }) {
  const [seconds, setSeconds] = useState(OFFER_SECONDS);
  const count = offer.items.reduce((sum, i) => sum + i.qty, 0);

  // The request expires if the rider doesn't respond in time.
  useEffect(() => {
    if (seconds === 0) {
      onDecline();
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  return (
    <section className="offer" aria-live="assertive">
      <div className="offer-top">
        <p className="offer-title">New delivery request</p>
        <p className="offer-timer">{seconds}s</p>
      </div>
      <p className="offer-earning">{peso(offer.earning)}</p>
      <p className="muted">
        {offer.distanceKm} km, {count} {count === 1 ? 'item' : 'items'}, cash on delivery
      </p>

      <div className="route">
        <div className="route-row">
          <Store size={18} className="icon-sili" aria-hidden="true" />
          <div>
            <p className="route-name">{offer.store}</p>
            <p className="route-addr">{offer.storeAddress}</p>
          </div>
        </div>
        <div className="route-line" />
        <div className="route-row">
          <MapPin size={18} className="icon-pili" aria-hidden="true" />
          <div>
            <p className="route-name">{offer.customer}</p>
            <p className="route-addr">{offer.customerAddress}</p>
          </div>
        </div>
      </div>

      <div className="offer-actions">
        <button type="button" className="btn btn-ghost" onClick={onDecline}>
          Decline
        </button>
        <button type="button" className="btn btn-primary" onClick={onAccept}>
          Accept
        </button>
      </div>
      <span className="timer-bar" style={{ width: `${(seconds / OFFER_SECONDS) * 100}%` }} />
    </section>
  );
}

export default function Jobs() {
  const { application, online, toggleOnline, offer, acceptOffer, declineOffer, activeJob, history } = useAuth();
  const now = useNow(60000);

  if (activeJob) return <ActiveJob />;

  const firstName = application.name.split(' ')[0];
  const today = new Date(now).toDateString();
  const todayCount = history.filter((j) => new Date(j.completedAt).toDateString() === today).length;

  return (
    <div className="page page-narrow">
      <p className="hello">Ingat sa biyahe, {firstName}</p>
      <h1 className="page-title">{online ? 'You are online' : 'You are offline'}</h1>

      <div className={`status-card ${online ? 'status-on' : 'status-off'}`}>
        <div className="status-text">
          <p className="status-title">
            {online ? `Looking for orders in ${application.town}` : 'Go online to receive orders'}
          </p>
          <p className="status-sub">
            {online
              ? 'New requests appear here with a sound.'
              : `${todayCount} ${todayCount === 1 ? 'delivery' : 'deliveries'} completed today`}
          </p>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={online}
            onChange={(e) => toggleOnline(e.target.checked)}
            aria-label={online ? 'Go offline' : 'Go online'}
          />
          <span className="switch-track" aria-hidden="true" />
        </label>
      </div>
      <div className="status-band">
        <BanigBand id="jobs-band" height={10} />
      </div>

      {offer ? (
        <OfferCard key={offer.id} offer={offer} onAccept={acceptOffer} onDecline={declineOffer} />
      ) : (
        <div className="idle">
          <div className="idle-art">
            <MayonMark color={online ? '#DDEBDF' : COLORS.line} sun={COLORS.abacaSoft} />
          </div>
          <p className="muted">{online ? 'Waiting for the next order...' : 'No requests while you are offline.'}</p>
        </div>
      )}

      {online && (
        <p className="keep-open">
          <Smartphone size={18} aria-hidden="true" />
          <span>Keep HatodNa open on your screen while online. Your screen stays on so you don't miss requests.</span>
        </p>
      )}
    </div>
  );
}