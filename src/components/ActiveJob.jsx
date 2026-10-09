import { useState } from 'react';
import { Navigation, Camera, Phone } from 'lucide-react';
import { useRider } from '../context/RiderContext';
import { peso } from '../utils/format';
import BanigBand from './BanigBand';
import RouteMap from './RouteMap';

const STAGES = ['preparing', 'ready', 'on_the_way'];

// Google Maps directions to the exact pin (opens the Google Maps app on phones that have it).
function directionsUrl(point, fallbackAddress) {
  if (point) {
    return `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${fallbackAddress}, Albay`)}`;
}

export default function ActiveJob() {
  const { activeJob: job, pickUp, completeDelivery, myLocation, locationStatus } = useRider();
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const delivering = job.status === 'on_the_way';
  const stage = STAGES.indexOf(job.status);

  // Older orders may not have pins saved on the order, so fall back to the store's current pin.
  const storePoint =
    job.store_lat != null
      ? { lat: job.store_lat, lng: job.store_lng }
      : job.store?.lat != null
        ? { lat: job.store.lat, lng: job.store.lng }
        : null;
  const customerPoint = job.delivery_lat != null ? { lat: job.delivery_lat, lng: job.delivery_lng } : null;
  const riderPoint = myLocation ?? (job.rider_lat != null ? { lat: job.rider_lat, lng: job.rider_lng } : null);

  const place = delivering
    ? {
        label: 'Deliver to',
        name: job.customer_name || 'Customer',
        address: job.address,
        landmark: job.landmark,
        phone: job.customer_phone,
        point: customerPoint,
      }
    : {
        label: 'Pick up from',
        name: job.store?.name ?? 'Store',
        address: `${job.store?.address ?? ''}, ${job.store?.town ?? ''}`,
        landmark: '',
        phone: job.store?.phone,
        point: storePoint,
      };

  const title = {
    preparing: 'Head to the store',
    ready: 'Pick up the order',
    on_the_way: 'Deliver to the customer',
  }[job.status];

  const markers = [
    { id: 'store', kind: 'store', ...storePoint, label: job.store?.name ?? 'Store' },
    { id: 'customer', kind: 'customer', ...customerPoint, label: job.customer_name || 'Customer' },
    riderPoint ? { id: 'rider', kind: 'rider', ...riderPoint, label: 'You' } : null,
  ];

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
      <p className="hello">Delivery in progress, {job.code}</p>
      <h1 className="page-title">{title}</h1>
      <div className="progress">
        {STAGES.map((s, i) => (
          <span key={s} className={`progress-bar${i < stage ? ' done' : ''}${i === stage ? ' now' : ''}`} />
        ))}
      </div>

      <section className="job-map">
        <RouteMap markers={markers} height="17rem" />
        <div className="map-legend">
          <span>
            <i style={{ background: '#B8202B' }} />
            Store
          </span>
          <span>
            <i style={{ background: '#2E5E3E' }} />
            Customer
          </span>
          <span>
            <i style={{ background: '#D8A23A' }} />
            You
          </span>
          {job.distance_km ? <span>Store to customer: about {job.distance_km} km</span> : null}
        </div>
        {locationStatus === 'denied' && (
          <p className="notice-box">
            Location is off. Allow location for HatodNa Rider in your browser settings, so the customer can see you're on
            the way.
          </p>
        )}
        {locationStatus === 'unavailable' && (
          <p className="notice-box">We can't get your location right now. Check that GPS is on.</p>
        )}
        {locationStatus === 'sharing' && (
          <p className="muted small">Sharing your location with the customer during this delivery.</p>
        )}
      </section>

      <div className="bleed">
        <BanigBand id="job-band" height={10} />
      </div>

      {job.status === 'preparing' && (
        <p className="keep-open">
          The store is still preparing this order. Head there now, and the button below unlocks once they mark it ready.
        </p>
      )}

      <section className="job-card">
        <p className="job-label">{place.label}</p>
        <p className="job-place">{place.name}</p>
        <p className="muted">{place.address}</p>
        {place.landmark && <p className="job-landmark">Landmark: {place.landmark}</p>}
        <div className="job-buttons">
          <a className="map-btn map-btn-main" href={directionsUrl(place.point, place.address)} target="_blank" rel="noreferrer">
            <Navigation size={18} aria-hidden="true" />
            {place.point ? 'Navigate with Google Maps' : 'Open in Maps (address only)'}
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