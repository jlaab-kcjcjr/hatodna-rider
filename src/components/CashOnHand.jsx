import { Wallet } from 'lucide-react';
import { useRider } from '../context/RiderContext';
import { peso } from '../utils/format';

// Cash the rider is holding from COD deliveries that hasn't been remitted yet.
// Updated by the system after every completed delivery.
export default function CashOnHand() {
  const { cash } = useRider();
  if (!cash) return null;

  const count = Number(cash.order_count ?? 0);
  const collected = Number(cash.cash_collected ?? 0);
  const earnings = Number(cash.rider_earnings ?? 0);
  const toRemit = Number(cash.to_remit ?? 0);
  const since = cash.oldest_at
    ? new Date(cash.oldest_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';

  return (
    <section className="cash-hand" aria-label="Cash on hand">
      <div className="cash-hand-top">
        <Wallet size={20} aria-hidden="true" />
        <p className="cash-hand-label">Cash on hand</p>
      </div>
      <p className="cash-hand-amount">{peso(collected)}</p>
      <p className="muted small">
        {count === 0
          ? 'No unremitted cash. Collected COD cash will show here after each delivery.'
          : `From ${count} ${count === 1 ? 'delivery' : 'deliveries'} since ${since}`}
      </p>

      {count > 0 && (
        <dl className="cash-hand-rows">
          <div>
            <dt>Your earnings (keep)</dt>
            <dd>{peso(earnings)}</dd>
          </div>
          <div className="cash-hand-remit">
            <dt>To remit to HatodNa</dt>
            <dd>{peso(Math.max(toRemit, 0))}</dd>
          </div>
        </dl>
      )}
      {toRemit < 0 && (
        <p className="muted small">
          Your cash is less than your earnings, so HatodNa owes you {peso(-toRemit)}. It will be settled at remittance.
        </p>
      )}
    </section>
  );
}