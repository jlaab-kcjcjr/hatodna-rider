import { useState } from 'react';
import { Store, MapPin, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRider } from '../context/RiderContext';
import { COLORS } from '../theme';
import { peso } from '../utils/format';
import BanigBand from '../components/BanigBand';
import MayonMark from '../components/MayonMark';
import ActiveJob from '../components/ActiveJob';

function OrderOffer({ order }) {
  const { claimOrder } = useRider();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const count = (order.order_items ?? []).reduce((sum, i) => sum + i.qty, 0);

  const onAccept = async () => {
    setBusy(true);
    setError('');
    try {
      await claimOrder(order.id);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <section className="offer">
      <div className="offer-top">
        <p className="offer-title">{order.status === 'ready' ? 'Ready for pickup now' : 'Being prepared'}</p>
        <p className="offer-timer">{order.code}</p>
      </div>
      <p className="offer-earning">{peso(order.rider_earning)}</p>
      <p className="muted">
        {count} {count === 1 ? 'item' : 'items'}, collect {peso(order.total)} cash
      </p>

      <div className="route">
        <div className="route-row">
          <Store size={18} className="icon-sili" aria-hidden="true" />
          <div>
            <p className="route-name">{order.store?.name}</p>
            <p className="route-addr">{order.store?.address}</p>
          </div>
        </div>
        <div className="route-line" />
        <div className="route-row">
          <MapPin size={18} className="icon-pili" aria-hidden="true" />
          <div>
            <p className="route-name">{order.customer_name || 'Customer'}</p>
            <p className="route-addr">{order.address}</p>
          </div>
        </div>
      </div>

      {error && <p className="form-error register-error">{error}</p>}
      <div className="offer-actions">
        <button type="button" className="btn btn-primary" disabled={busy} onClick={onAccept}>
          {busy ? 'Accepting...' : 'Accept delivery'}
        </button>
      </div>
    </section>
  );
}

export default function Jobs() {
  const { profile } = useAuth();
  const { rider, available, activeJob, history, toggleOnline } = useRider();
  const [switching, setSwitching] = useState(false);

  if (activeJob) return <ActiveJob />;

  const online = rider.is_online;
  const firstName = (profile?.full_name || 'rider').split(' ')[0];
  const today = new Date().toDateString();
  const todayCount = history.filter((j) => new Date(j.delivered_at).toDateString() === today).length;

  const onToggle = async (value) => {
    setSwitching(true);
    try {
      await toggleOnline(value);
    } catch (err) {
      window.alert(err.message);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="page page-narrow">
      <p className="hello">Ingat sa biyahe, {firstName}</p>
      <h1 className="page-title">{online ? 'You are online' : 'You are offline'}</h1>

      <div className={`status-card ${online ? 'status-on' : 'status-off'}`}>
        <div className="status-text">
          <p className="status-title">{online ? `Looking for orders in ${rider.town}` : 'Go online to receive orders'}</p>
          <p className="status-sub">
            {online
              ? 'New orders appear here with a sound.'
              : `${todayCount} ${todayCount === 1 ? 'delivery' : 'deliveries'} completed today`}
          </p>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={online}
            disabled={switching}
            onChange={(e) => onToggle(e.target.checked)}
            aria-label={online ? 'Go offline' : 'Go online'}
          />
          <span className="switch-track" aria-hidden="true" />
        </label>
      </div>
      <div className="status-band">
        <BanigBand id="jobs-band" height={10} />
      </div>

      {online && available.length > 0 ? (
        <>
          <h2 className="section-title">
            {available.length} {available.length === 1 ? 'delivery' : 'deliveries'} available
          </h2>
          {available.map((o) => (
            <OrderOffer key={o.id} order={o} />
          ))}
        </>
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
          <span>Keep HatodNa open on your screen while online. Your screen stays on so you don't miss orders.</span>
        </p>
      )}
    </div>
  );
}