import { useState } from 'react';
import { Navigation, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DELIVERY_STEPS } from '../data/riderData';
import { compressImage } from '../utils/photos';
import { peso } from '../utils/format';
import BanigBand from './BanigBand';

export default function ActiveJob() {
  const { activeJob: job, advanceJob } = useAuth();
  const [proof, setProof] = useState('');
  const [error, setError] = useState('');

  const step = job.step;
  const current = DELIVERY_STEPS[step];
  const lastStep = step === DELIVERY_STEPS.length - 1;
  const goingToStore = step < 2;
  const place = goingToStore
    ? { name: job.store, address: job.storeAddress, landmark: '' }
    : { name: job.customer, address: job.customerAddress, landmark: job.landmark };
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${place.address}, Albay`)}`;

  const onProof = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setProof(await compressImage(file, 700, 0.6));
      setError('');
    } catch {
      setError('That photo could not be read. Try taking it again.');
    }
  };

  const onAction = () => {
    if (lastStep && !proof) {
      setError('Take a proof-of-delivery photo before completing.');
      return;
    }
    if (lastStep) window.alert(`Delivery complete. You earned ${peso(job.earning)}. Ingat sa biyahe!`);
    setError('');
    advanceJob();
  };

  return (
    <div className="page page-narrow">
      <p className="hello">Delivery in progress</p>
      <h1 className="page-title">{current.title}</h1>
      <div className="progress">
        {DELIVERY_STEPS.map((s, i) => (
          <span key={s.title} className={`progress-bar${i < step ? ' done' : ''}${i === step ? ' now' : ''}`} />
        ))}
      </div>
      <div className="bleed">
        <BanigBand id="job-band" height={10} />
      </div>

      <section className="job-card">
        <p className="job-label">{goingToStore ? 'Pick up from' : 'Deliver to'}</p>
        <p className="job-place">{place.name}</p>
        <p className="muted">{place.address}</p>
        {place.landmark && <p className="job-landmark">Landmark: {place.landmark}</p>}
        <a className="map-btn" href={mapsUrl} target="_blank" rel="noreferrer">
          <Navigation size={18} aria-hidden="true" />
          Open in Maps
        </a>
      </section>

      <section className="job-card">
        <p className="job-label">Order items</p>
        {job.items.map((i) => (
          <p key={i.name}>
            {i.qty} × {i.name}
          </p>
        ))}
      </section>

      <section className={`job-card${lastStep ? ' cash-card' : ''}`}>
        <p className="job-label">Collect from customer</p>
        <p className="cash">{peso(job.orderTotal)}</p>
        <p className="muted">Cash on delivery. Your earning: {peso(job.earning)}</p>
      </section>

      {lastStep && (
        <label className="proof">
          {proof ? <img src={proof} alt="Proof of delivery" /> : <Camera size={26} aria-hidden="true" />}
          <span>{proof ? 'Proof photo added. Tap to retake.' : 'Take proof of delivery photo'}</span>
          <input type="file" accept="image/*" capture="environment" onChange={onProof} hidden />
        </label>
      )}

      {error && <p className="form-error register-error">{error}</p>}

      <div className="action-bar">
        <button type="button" className="btn btn-primary btn-block" onClick={onAction}>
          {current.action}
        </button>
      </div>
    </div>
  );
}