import { useRider } from '../context/RiderContext';
import { peso } from '../utils/format';
import { useNow } from '../utils/useNow';
import BanigBand from '../components/BanigBand';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function formatTime(timestamp) {
  const d = new Date(timestamp);
  const date = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
  return `${date}, ${time}`;
}

export default function Earnings() {
  const { history } = useRider();
  const now = useNow(60000);

  const todayKey = new Date(now).toDateString();
  const deliveredAt = (j) => new Date(j.delivered_at).getTime();
  const today = history.filter((j) => new Date(j.delivered_at).toDateString() === todayKey);
  const week = history.filter((j) => now - deliveredAt(j) < WEEK_MS);
  const sum = (list) => list.reduce((total, j) => total + Number(j.rider_earning), 0);
  const toRemit = history
    .filter((j) => !j.cash_remitted && j.payment_method === 'cod')
    .reduce((total, j) => total + Number(j.total) - Number(j.rider_earning), 0);

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
          The store's and HatodNa's share of the cash you collected. Remit it at the HatodNa office or by GCash, and our
          team will mark it as received.
        </p>
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
                  {j.store?.name} to {j.customer_name || 'Customer'}
                </p>
                <p className="muted small">
                  {formatTime(j.delivered_at)}, {j.code}
                  {j.cash_remitted ? ', cash remitted' : ''}
                </p>
              </div>
              <span className="earn-plus">+{peso(j.rider_earning)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}