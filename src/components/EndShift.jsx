import { useState } from 'react';
import { Camera, Flag, Clock } from 'lucide-react';
import { useRider } from '../context/RiderContext';
import { peso } from '../utils/format';

const when = (iso) =>
  new Date(iso).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

// End shift: the system calculates the expected remittance, the rider reviews it and taps OK,
// remits the cash in person, then uploads proof of remittance.
export default function EndShift() {
  const { rider, cash, openRemittance, startRemittance, submitRemittance, toggleOnline } = useRider();
  const [reviewing, setReviewing] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async (task) => {
    setBusy(true);
    setError('');
    try {
      await task();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onProof = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
    setError('');
  };

  // 1. Remittance accepted but cash not handed over yet: remit, then upload proof.
  if (openRemittance?.status === 'awaiting_cash') {
    const r = openRemittance;
    const onSubmit = () => {
      if (!proofFile) {
        setError('Take a photo of your proof of remittance first.');
        return;
      }
      run(async () => {
        await submitRemittance(r.id, proofFile, note);
        setProofFile(null);
        setProofPreview('');
        setNote('');
      });
    };

    return (
      <section className="remit-card">
        <p className="remit-label">Remit your COD cash</p>
        <p className="remit-amount">{peso(r.expected_amount)}</p>
        <dl className="remit-rows">
          <div>
            <dt>Cash collected ({r.order_count} {r.order_count === 1 ? 'delivery' : 'deliveries'})</dt>
            <dd>{peso(r.cash_collected)}</dd>
          </div>
          <div>
            <dt>Your earnings (keep)</dt>
            <dd>− {peso(r.rider_earnings)}</dd>
          </div>
          <div className="remit-total">
            <dt>Expected remittance</dt>
            <dd>{peso(r.expected_amount)}</dd>
          </div>
        </dl>

        <ol className="remit-steps">
          <li>Bring the cash to the HatodNa office or drop-off point.</li>
          <li>Hand it to the staff and ask for a signed acknowledgment slip.</li>
          <li>Take a photo of the slip and upload it below.</li>
        </ol>

        <label className="proof">
          {proofPreview ? <img src={proofPreview} alt="Proof of remittance" /> : <Camera size={26} aria-hidden="true" />}
          <span>{proofPreview ? 'Proof photo added. Tap to retake.' : 'Take photo of proof of remittance'}</span>
          <input type="file" accept="image/*" capture="environment" onChange={onProof} hidden />
        </label>

        <label className="remit-note">
          <span>Note for HatodNa (optional)</span>
          <textarea
            rows={2}
            value={note}
            placeholder="Example: Remitted at the Legazpi office, received by Ana"
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        {error && <p className="form-error register-error">{error}</p>}
        <button type="button" className="btn btn-primary btn-block" disabled={busy} onClick={onSubmit}>
          {busy ? 'Uploading proof...' : 'Submit proof and end shift'}
        </button>
        <p className="muted small">Started {when(r.created_at)}</p>
      </section>
    );
  }

  const count = Number(cash?.order_count ?? 0);
  const collected = Number(cash?.cash_collected ?? 0);
  const earnings = Number(cash?.rider_earnings ?? 0);
  const expected = Math.round((collected - earnings) * 100) / 100;

  // 2. Proof submitted: waiting for HatodNa to count and verify.
  const waiting =
    openRemittance?.status === 'submitted' ? (
      <section className="remit-card remit-waiting">
        <div className="remit-waiting-top">
          <Clock size={20} aria-hidden="true" />
          <p className="remit-label">Remittance submitted</p>
        </div>
        <p>
          HatodNa is verifying your remittance of <strong>{peso(openRemittance.expected_amount)}</strong>.
        </p>
        <p className="muted small">Submitted {when(openRemittance.submitted_at)}</p>
      </section>
    ) : null;

  if (!rider?.is_online && count === 0) return waiting;

  // 3. End shift button, then the system's calculation for the rider to review.
  return (
    <>
      {waiting}
      {!reviewing ? (
        <button
          type="button"
          className="end-shift-btn"
          onClick={() => {
            setError('');
            setReviewing(true);
          }}
        >
          <Flag size={18} aria-hidden="true" />
          End shift
        </button>
      ) : (
        <section className="remit-card">
          <p className="remit-label">End your shift?</p>
          {count === 0 ? (
            <p>You have no COD cash to remit. Ending your shift will set you offline.</p>
          ) : (
            <>
              <p className="muted small">The system calculated your remittance for this shift:</p>
              <dl className="remit-rows">
                <div>
                  <dt>Cash collected ({count} {count === 1 ? 'delivery' : 'deliveries'})</dt>
                  <dd>{peso(collected)}</dd>
                </div>
                <div>
                  <dt>Your earnings (keep)</dt>
                  <dd>− {peso(earnings)}</dd>
                </div>
                <div className="remit-total">
                  <dt>Expected remittance</dt>
                  <dd>{peso(expected)}</dd>
                </div>
              </dl>
              <p className="muted small">
                Tapping OK sets you offline. Then bring {peso(Math.max(expected, 0))} to the HatodNa office or drop-off
                point.
              </p>
            </>
          )}

          {error && <p className="form-error register-error">{error}</p>}
          <div className="remit-actions">
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => setReviewing(false)}>
              Not yet
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  if (count === 0) {
                    if (rider?.is_online) await toggleOnline(false);
                  } else {
                    await startRemittance();
                  }
                  setReviewing(false);
                })
              }
            >
              {busy ? 'Saving...' : count === 0 ? 'End shift' : 'OK'}
            </button>
          </div>
        </section>
      )}
    </>
  );
}