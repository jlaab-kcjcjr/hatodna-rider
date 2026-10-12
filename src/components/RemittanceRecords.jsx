import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useRider } from '../context/RiderContext';
import { peso } from '../utils/format';

const when = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';

const STATUS = {
  awaiting_cash: { label: 'Remit cash', tone: 'wait' },
  submitted: { label: 'Being verified', tone: 'wait' },
  short: { label: 'Cash shortage', tone: 'bad' },
  settled: { label: 'Settled', tone: 'good' },
  resolved: { label: 'Shortage resolved', tone: 'good' },
};

const RESOLUTIONS = {
  rider_paid: 'You paid the shortage',
  deduct_earnings: 'Deducted from your earnings',
  waived: 'Waived by HatodNa',
  other: 'See note from HatodNa',
};

// A cash shortage: the rider explains what happened, then sees HatodNa's decision here.
function ShortageCard({ r }) {
  const { explainShortage } = useRider();
  const [text, setText] = useState(r.rider_explanation ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const onSend = async () => {
    if (text.trim().length < 5) {
      setError('Write a short explanation of what happened.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await explainShortage(r.id, text.trim());
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="shortage-card">
      <div className="shortage-top">
        <AlertTriangle size={20} aria-hidden="true" />
        <p className="remit-label">Cash shortage: {peso(r.shortage_amount)}</p>
      </div>
      <p>
        HatodNa counted {peso(r.counted_amount)} but expected {peso(r.expected_amount)} from your shift on{' '}
        {when(r.created_at)}.
      </p>
      {r.admin_note && <p className="muted small">Note from HatodNa: {r.admin_note}</p>}

      <label className="remit-note">
        <span>Your explanation</span>
        <textarea
          rows={3}
          value={text}
          placeholder="Example: Customer for order HN-1042 only paid ₱230, I wrote it in the delivery note"
          onChange={(e) => {
            setText(e.target.value);
            setSent(false);
            setError('');
          }}
        />
      </label>
      {error && <p className="form-error register-error">{error}</p>}
      {(sent || (r.rider_explanation && text === r.rider_explanation)) && (
        <p className="muted small">Explanation sent. HatodNa will review it and update you here.</p>
      )}
      <button type="button" className="btn btn-primary btn-block" disabled={busy} onClick={onSend}>
        {busy ? 'Sending...' : r.rider_explanation ? 'Update explanation' : 'Send explanation'}
      </button>
    </section>
  );
}

// Remittance records on the rider dashboard: open shortages first, then recent settlements.
export default function RemittanceRecords() {
  const { remittances } = useRider();
  const shortages = remittances.filter((r) => r.status === 'short');
  const recent = remittances.filter((r) => r.status === 'settled' || r.status === 'resolved').slice(0, 5);

  if (shortages.length === 0 && recent.length === 0) return null;

  return (
    <>
      {shortages.map((r) => (
        <ShortageCard key={r.id} r={r} />
      ))}

      {recent.length > 0 && (
        <section className="remit-history">
          <h2 className="section-title">Remittance records</h2>
          <ul>
            {recent.map((r) => {
              const s = STATUS[r.status];
              return (
                <li key={r.id}>
                  <div>
                    <p className="remit-history-amount">{peso(r.counted_amount ?? r.expected_amount)}</p>
                    <p className="muted small">
                      Shift ended {when(r.created_at)} · {r.order_count} {r.order_count === 1 ? 'delivery' : 'deliveries'}
                    </p>
                    {r.status === 'resolved' && (
                      <p className="small">
                        {RESOLUTIONS[r.resolution] ?? r.resolution}
                        {r.resolution_note ? `. ${r.resolution_note}` : ''}
                      </p>
                    )}
                  </div>
                  <span className={`remit-chip remit-chip-${s.tone}`}>{s.label}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}