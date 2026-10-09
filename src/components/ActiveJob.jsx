import { useState } from 'react';
import { Navigation, Camera, Phone } from 'lucide-react';
import { useRider } from '../context/RiderContext';
import { peso } from '../utils/format';
import BanigBand from './BanigBand';

const STAGES = ['preparing', 'ready', 'on_the_way'];

export default function ActiveJob() {
  const { activeJob: job, pickUp, completeDelivery } = useRider();
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const delivering = job.status === 'on_the_way';
  const stage = STAGES.indexOf(job.status);
  const place = delivering
    ? {
        label: 'Deliver to',
        name: job.customer_name || 'Customer',
        address: job.address,
        landmark: job.landmark,
        phone: job.customer_phone,
      }
    : {
        label: 'Pick up from',
        name: job.store?.name ?? 'Store',
        address: `${job.store?.address ?? ''}, ${job.store?.town ?? ''}`,
        landmark: '',
        phone: job.store?.phone,
      };
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${place.address}, Albay`)}`;

  const title = {
    preparing: 'Head to the store',
    ready: 'Pick up the order',
    on_the_way: 'Deliver to the customer',
  }[job.status];

  const onProof = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
    setError('');
  };

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

  const onComplete = () => {
    if (!proofFile) {
      setError('Take a proof-of-delivery photo before completing.');
      return;
    }
    run(async () => {
      await completeDelivery(job.id, proofFile);
      window.alert(`Delivery complete. You earned ${peso(job.rider_earning)}. Ingat sa biyahe!`);
    });
  };

  return (
    <div className="page page-narrow">
      <p className="hello">
        Delivery in progress, {job.code}
      </p>
      <h1 className="page-title">{title}</h1>
      <div className="progress">
        {STAGES.map((s, i) => (
          <span key={s} className={`progress-bar${i < stage ? ' done' : ''}${i === stage ? ' now' : ''}`} />
        ))}
      </div>
      <div className="bleed">
        <BanigBand id="job-band" height={10} />
      </div>

      {job.status === 'preparing' && (
        <p className="keep-open">The store is still preparing this order. Head there now, and the button below unlocks once they mark it ready.</p>
      )}

      <section className="job-card">
        <p className="job-label">{place.label}</p>
        <p className="job-place">{place.name}</p>
        <p className="muted">{place.address}</p>
        {place.landmark && <p className="job-landmark">Landmark: {place.landmark}</p>}
        <div className="job-buttons">
          <a className="map-btn" href={mapsUrl} target="_blank" rel="noreferrer">
            <Navigation size={18} aria-hidden="true" />
            Open in Maps
          </a>
          {place.phone && (
            <a className="map-btn" href={`tel:${place.phone}`}>
              <Phone size={18} aria-hidden="true" />
              Call
            </a>
          )}
        </div>
      </section>

      <section className="job-card">
        <p className="job-label">Order items</p>
        {(job.order_items ?? []).map((i) => (
          <p key={i.name}>
            {i.qty} × {i.name}
          </p>
        ))}
        {job.note && <p className="muted small">Note: {job.note}</p>}
      </section>

      <section className={`job-card${delivering ? ' cash-card' : ''}`}>
        <p className="job-label">Collect from customer</p>
        <p className="cash">{peso(job.total)}</p>
        <p className="muted">Cash on delivery. Your earning: {peso(job.rider_earning)}</p>
      </section>

      {delivering && (
        <label className="proof">
          {proofPreview ? <img src={proofPreview} alt="Proof of delivery" /> : <Camera size={26} aria-hidden="true" />}
          <span>{proofPreview ? 'Proof photo added. Tap to retake.' : 'Take proof of delivery photo'}</span>
          <input type="file" accept="image/*" capture="environment" onChange={onProof} hidden />
        </label>
      )}

      {error && <p className="form-error register-error">{error}</p>}

      <div className="action-bar">
        {job.status === 'preparing' && (
          <button type="button" className="btn btn-primary btn-block" disabled>
            Waiting for the store to finish...
          </button>
        )}
        {job.status === 'ready' && (
          <button type="button" className="btn btn-primary btn-block" disabled={busy} onClick={() => run(() => pickUp(job.id))}>
            {busy ? 'Saving...' : 'Order picked up'}
          </button>
        )}
        {delivering && (
          <button type="button" className="btn btn-primary btn-block" disabled={busy} onClick={onComplete}>
            {busy ? 'Uploading proof...' : 'Complete delivery'}
          </button>
        )}
      </div>
    </div>
  );
}