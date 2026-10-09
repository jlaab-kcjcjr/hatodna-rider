import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Camera, CircleCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRider } from '../context/RiderContext';
import { TOWNS, VEHICLES, DOCUMENTS } from '../data/riderData';
import BanigBand from '../components/BanigBand';

const MAX_FILE_BYTES = 15 * 1024 * 1024;

const toLocal = (phone) => (phone?.startsWith('+63') ? `0${phone.slice(3)}` : phone ?? '');

function toInternational(input) {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('63')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return /^9\d{9}$/.test(digits) ? `+63${digits}` : null;
}

function ResubmitForm({ rider, profile }) {
  const { resubmitApplication } = useRider();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(toLocal(profile?.phone));
  const [town, setTown] = useState(rider.town);
  const [vehicle, setVehicle] = useState(rider.vehicle);
  const [plate, setPlate] = useState(rider.plate ?? '');
  const [newDocs, setNewDocs] = useState({}); // documents replaced or added on this page
  const [previews, setPreviews] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isMotor = vehicle !== 'Bicycle';
  const requiredDocs = DOCUMENTS.filter((d) => isMotor || !d.motorOnly);
  const alreadyUploaded = (key) => (rider.rider_documents ?? []).some((d) => d.doc_type === key);

  const onPhoto = (doc, e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Choose a photo (image file).');
    if (file.size > MAX_FILE_BYTES) return setError('That photo is too large. Use one under 15 MB.');
    setNewDocs((d) => ({ ...d, [doc.key]: file }));
    setPreviews((p) => ({ ...p, [doc.key]: URL.createObjectURL(file) }));
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 3) return setError('Enter your full name as it appears on your ID.');
    const intlPhone = toInternational(phone);
    if (!intlPhone) return setError('Enter your mobile number, like 0917 123 4567.');
    if (!town) return setError('Choose the town where you will deliver.');
    if (isMotor && plate.trim().length < 5) return setError('Enter your plate number.');
    const missing = requiredDocs.find((d) => !alreadyUploaded(d.key) && !newDocs[d.key]);
    if (missing) return setError(`Add a photo for "${missing.label}".`);

    setBusy(true);
    setError('');
    try {
      await resubmitApplication({
        fullName: name.trim(),
        phone: intlPhone,
        town,
        vehicle,
        plate: isMotor ? plate.trim().toUpperCase() : '',
        newDocs: Object.fromEntries(requiredDocs.filter((d) => newDocs[d.key]).map((d) => [d.key, newDocs[d.key]])),
      });
      navigate('/pending', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="register">
      <form className="page page-narrow" onSubmit={onSubmit}>
        <Link to="/pending" className="back-link">
          <ArrowLeft size={18} aria-hidden="true" />
          Back
        </Link>
        <h1 className="page-title">Fix your application</h1>
        <p className="note-box">
          <strong>What our team asked for:</strong> {rider.status_note || 'Please check your details and documents.'}
        </p>
        <div className="bleed">
          <BanigBand id="resubmit-band" height={10} />
        </div>

        <h2 className="section-title">Personal information</h2>
        <label className="field">
          <span>Full name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </label>
        <label className="field">
          <span>Mobile number</span>
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0917 123 4567"
            autoComplete="tel"
          />
        </label>
        <span className="field-label">Where will you deliver?</span>
        <div className="wrap" role="group" aria-label="Delivery town">
          {TOWNS.map((t) => (
            <button
              key={t}
              type="button"
              className={`chip${town === t ? ' active' : ''}`}
              aria-pressed={town === t}
              onClick={() => setTown(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <h2 className="section-title">Rider profile</h2>
        <div className="vehicles" role="group" aria-label="Vehicle type">
          {VEHICLES.map((v) => (
            <button
              key={v}
              type="button"
              className={`vehicle${vehicle === v ? ' active' : ''}`}
              aria-pressed={vehicle === v}
              onClick={() => {
                setVehicle(v);
                setError('');
              }}
            >
              {v}
            </button>
          ))}
        </div>
        {isMotor && (
          <label className="field plate-field">
            <span>Plate number</span>
            <input value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="ABC 1234" autoCapitalize="characters" />
          </label>
        )}

        <h2 className="section-title">Documents</h2>
        <p className="muted small">Replace any photo our team asked you to fix. Tap a document to choose a new photo.</p>
        {requiredDocs.map((d) => {
          const src = previews[d.key];
          const had = alreadyUploaded(d.key);
          return (
            <label key={d.key} className="doc">
              {src ? (
                <img className="doc-thumb" src={src} alt="" />
              ) : (
                <span className="doc-empty">
                  <Camera size={22} aria-hidden="true" />
                </span>
              )}
              <span className="doc-text">
                <span className="doc-label">{d.label}</span>
                <span className={`doc-status${src || had ? ' ok' : ''}`}>
                  {src ? 'New photo added. Tap to change.' : had ? 'Uploaded. Tap to replace.' : 'Needed. Tap to add a photo.'}
                </span>
              </span>
              {(src || had) && <CircleCheck size={22} className="icon-pili" aria-hidden="true" />}
              <input
                type="file"
                accept="image/*"
                capture={d.key === 'selfie' ? 'user' : undefined}
                onChange={(e) => onPhoto(d, e)}
                hidden
              />
            </label>
          );
        })}

        {error && <p className="form-error register-error">{error}</p>}

        <div className="register-actions">
          <Link to="/pending" className="btn btn-ghost">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Sending...' : 'Resubmit for review'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Resubmit() {
  const { session, loading, profile } = useAuth();
  const { rider, riderLoading } = useRider();

  if (loading || riderLoading) return <p className="page-loading">Loading...</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (!rider) return <Navigate to="/register" replace />;
  if (rider.status !== 'rejected') return <Navigate to="/pending" replace />;

  return <ResubmitForm key={rider.id} rider={rider} profile={profile} />;
}