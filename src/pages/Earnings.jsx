import { useAuth } from '../context/AuthContext';
import { peso } from '../utils/format';
import { useNow } from '../utils/useNow';
import BanigBand from '../components/BanigBand';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
}

export default function Earnings() {
  const { history, remitCash } = useAuth();
  const now = useNow(60000);

  const todayKey = new Date(now).toDateString();
  const today = history.filter((j) => new Date(j.completedAt).toDateString() === todayKey);
  const week = history.filter((j) => now - j.completedAt < WEEK_MS);
  const sum = (list) => list.reduce((total, j) => total + j.earning, 0);
  const toRemit = history.filter((j) => !j.remitted).reduce((total, j) => total + (j.orderTotal - j.earning), 0);

  const confirmRemit = () => {
    if (window.confirm(`Confirm that you handed ${peso(toRemit)} to HatodNa.`)) remitCash();
  };

  return (
    <div className="page page-narrow">
      <h1 className="page-title">Earnings</h1>

      <section className="earn-hero">
        <p className="earn-label">Today's earnings</p>
        <p className="earn-amount">{peso(sum(today))}</p>
        <div className="earn-stats">
          <div>
            <p className="earn-num">{today.length}</p>
            <p className="earn-sub">deliveries today</p>
          </div>
          <div>
            <p className="earn-num">{peso(sum(week))}</p>
            <p className="earn-sub">last 7 days</p>
          </div>
        </div>
        <div className="earn-band">
          <BanigBand id="earn-band" height={10} />
        </div>
      </section>

      <section className="remit">
        <p className="job-label">Cash to remit</p>
        <p className="remit-amount">{peso(toRemit)}</p>
        <p className="remit-sub">
          The store's and HatodNa's share of the cash you collected. Remit it at the HatodNa office or by GCash.
        </p>
        {toRemit > 0 && (
          <button type="button" className="btn btn-dark" onClick={confirmRemit}>
            Mark as remitted
          </button>
        )}
      </section>

      <h2 className="section-title">Completed deliveries</h2>
      {history.length === 0 ? (
        <p className="muted">Your completed deliveries will show up here.</p>
      ) : (
        <ul className="earn-list">
          {history.map((j) => (
            <li key={j.id} className="earn-row">
              <div className="earn-row-main">
                <p className="route-name">
                  {j.store} to {j.customer}
                </p>
                <p className="muted small">
                  {formatTime(j.completedAt)}, {j.distanceKm} km
                </p>
              </div>
              <span className="earn-plus">+{peso(j.earning)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}