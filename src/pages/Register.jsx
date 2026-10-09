import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Camera, CircleCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRider } from '../context/RiderContext';
import { TOWNS, VEHICLES, DOCUMENTS } from '../data/riderData';
import BanigBand from '../components/BanigBand';

// Matches the rider flowchart: personal information, then documents, then the rider profile.
const STEP_TITLES = ['Personal information', 'Documents', 'Rider profile'];
const MAX_FILE_BYTES = 15 * 1024 * 1024;

function toInternational(input) {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('63')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return /^9\d{9}$/.test(digits) ? `+63${digits}` : null;
}

export default function Register() {
  const { session, loading, profile, logout } = useAuth();
  const { rider, riderLoading, registerRider } = useRider();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState('');
  const [town, setTown] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [plate, setPlate] = useState('');
  const [docs, setDocs] = useState({}); // { license: File, ... }
  const [previews, setPreviews] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading || riderLoading) return <p className="page-loading">Loading...</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (rider) return <Navigate to="/" replace />;

  const isMotor = vehicle !== '' && vehicle !== 'Bicycle';
  const everyoneDocs = DOCUMENTS.filter((d) => !d.motorOnly);
  const motorDocs = DOCUMENTS.filter((d) => d.motorOnly);

  const validate = () => {
    if (step === 0) {
      if (name.trim().length < 3) return 'Enter your full name as it appears on your ID.';
      if (!toInternational(phone)) return 'Enter your mobile number, like 0917 123 4567.';
      if (!town) return 'Choose the town where you will deliver.';
    }
    if (step === 1) {
      const missing = everyoneDocs.find((d) => !docs[d.key]);
      if (missing) return `Add a photo for "${missing.label}".`;
    }
    if (step === 2) {
      if (!vehicle) return 'Choose the vehicle you will use.';
      if (isMotor && plate.trim().length < 5) return 'Enter your plate number.';
    }
    return '';
  };

  const onPhoto = (doc, e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Choose a photo (image file).');
    if (file.size > MAX_FILE_BYTES) return setError('That photo is too large. Use one under 15 MB.');
    setDocs((d) => ({ ...d, [doc.key]: file }));
    setPreviews((p) => ({ ...p, [doc.key]: URL.createObjectURL(file) }));
    setError('');
  };

  const onContinue = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    // Motorcycle and tricycle riders need a license and OR/CR. If any is missing, go back to Documents.
    const missingMotorDocs = isMotor ? motorDocs.filter((d) => !docs[d.key]) : [];
    if (missingMotorDocs.length > 0) {
      setStep(1);
      setError(
        `${vehicle} riders need a ${missingMotorDocs.map((d) => d.label).join(' and ')}. Add ${
          missingMotorDocs.length === 1 ? 'it' : 'them'
        } here, then continue.`
      );
      return;
    }

    // Only upload the documents needed for the chosen vehicle.
    const requiredDocs = isMotor ? DOCUMENTS : everyoneDocs;
    const neededDocs = Object.fromEntries(requiredDocs.map((d) => [d.key, docs[d.key]]));
    setBusy(true);
    try {
      await registerRider({
        fullName: name.trim(),
        phone: toInternational(phone),
        town,
        vehicle,
        plate: isMotor ? plate.trim().toUpperCase() : '',
        docs: neededDocs,
      });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const onBack = () => {
    setError('');
    if (step === 0) logout();
    else setStep(step - 1);
  };

  const renderDoc = (d, tag) => {
    const src = previews[d.key];
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
          <span className="doc-label">
            {d.label}
            <span className={`doc-tag${tag === 'Required' ? ' required' : ''}`}>{tag}</span>
          </span>
          <span className={`doc-status${src ? ' ok' : ''}`}>{src ? 'Added. Tap to replace.' : 'Tap to add a photo'}</span>
        </span>
        {src && <CircleCheck size={22} className="icon-pili" aria-hidden="true" />}
        <input
          type="file"
          accept="image/*"
          capture={d.key === 'selfie' ? 'user' : undefined}
          onChange={(e) => onPhoto(d, e)}
          hidden
        />
      </label>
    );
  };

  return (
    <div className="register">
      <form className="page page-narrow" onSubmit={onContinue}>
        <h1 className="page-title">Become a rider</h1>
        <p className="hello">
          Step {step + 1} of 3: {STEP_TITLES[step]}
        </p>
        <div className="progress">
          {STEP_TITLES.map((t, i) => (
            <span key={t} className={`progress-bar${i <= step ? ' done' : ''}`} />
          ))}
        </div>
        <div className="bleed">
          <BanigBand id="register-band" height={10} />
        </div>

        {step === 0 && (
          <>
            <label className="field register-first">
              <span>Full name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Dela Cruz" autoComplete="name" />
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
            <span className="field-label">Email</span>
            <p className="readonly">{session.user.email}</p>
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
          </>
        )}

        {step === 1 && (
          <>
            <p className="muted register-first">
              Take clear photos. They're stored privately, and only our review team can see them.
            </p>
            {everyoneDocs.map((d) => renderDoc(d, 'Required'))}
            <p className="field-label doc-group-label">If you ride a motorcycle or tricycle</p>
            {motorDocs.map((d) => renderDoc(d, 'For motorcycle or tricycle'))}
          </>
        )}

        {step === 2 && (
          <>
            <span className="field-label register-first">Vehicle type</span>
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
            {vehicle === 'Bicycle' && (
              <p className="muted small plate-field">Bicycle riders don't need a plate number, license, or OR/CR.</p>
            )}
          </>
        )}

        {error && <p className="form-error register-error">{error}</p>}

        <div className="register-actions">
          <button type="button" className="btn btn-ghost" onClick={onBack} disabled={busy}>
            {step === 0 ? 'Log out' : 'Back'}
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Uploading...' : step < 2 ? 'Continue' : 'Submit application'}
          </button>
        </div>
      </form>
    </div>
  );
}