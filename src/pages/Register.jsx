import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Camera, CircleCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TOWNS, VEHICLES, DOCUMENTS } from '../data/riderData';
import { compressImage } from '../utils/photos';
import BanigBand from '../components/BanigBand';

const STEP_TITLES = ['About you', 'Your vehicle', 'Documents'];

export default function Register() {
  const { user, application, submitApplication, logout } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [town, setTown] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [plate, setPlate] = useState('');
  const [docs, setDocs] = useState({});
  const [busyDoc, setBusyDoc] = useState('');
  const [error, setError] = useState('');

  if (!user) return <Navigate to="/login" replace />;
  if (application) return <Navigate to="/" replace />;

  const needsMotorDocs = vehicle !== 'Bicycle';
  const requiredDocs = DOCUMENTS.filter((d) => needsMotorDocs || !d.motorOnly);

  const validate = () => {
    if (step === 0) {
      if (name.trim().length < 3) return 'Enter your full name as it appears on your ID.';
      if (!town) return 'Choose the town where you will deliver.';
    }
    if (step === 1) {
      if (!vehicle) return 'Choose the vehicle you will use.';
      if (needsMotorDocs && plate.trim().length < 5) return 'Enter your plate number.';
    }
    if (step === 2) {
      const missing = requiredDocs.find((d) => !docs[d.key]);
      if (missing) return `Add a photo for "${missing.label}".`;
    }
    return '';
  };

  const onContinue = (e) => {
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
    submitApplication({
      name: name.trim(),
      town,
      vehicle,
      plate: needsMotorDocs ? plate.trim().toUpperCase() : '',
      docs,
    });
  };

  const onBack = () => {
    setError('');
    if (step === 0) logout();
    else setStep(step - 1);
  };

  const onPhoto = async (doc, e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusyDoc(doc.key);
    try {
      const dataUrl = await compressImage(file);
      setDocs((d) => ({ ...d, [doc.key]: dataUrl }));
      setError('');
    } catch {
      setError('That photo could not be read. Try another one.');
    } finally {
      setBusyDoc('');
    }
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
            <span className="field-label">Mobile number</span>
            <p className="readonly">{user.phone}</p>
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
            <span className="field-label register-first">Vehicle type</span>
            <div className="vehicles" role="group" aria-label="Vehicle type">
              {VEHICLES.map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`vehicle${vehicle === v ? ' active' : ''}`}
                  aria-pressed={vehicle === v}
                  onClick={() => setVehicle(v)}
                >
                  {v}
                </button>
              ))}
            </div>
            {needsMotorDocs && vehicle !== '' && (
              <label className="field plate-field">
                <span>Plate number</span>
                <input
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  placeholder="ABC 1234"
                  autoCapitalize="characters"
                />
              </label>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <p className="muted register-first">Take clear photos. Our team checks each one before approving you.</p>
            {requiredDocs.map((d) => {
              const src = docs[d.key];
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
                    <span className={`doc-status${src ? ' ok' : ''}`}>
                      {busyDoc === d.key ? 'Saving photo...' : src ? 'Added. Tap to replace.' : 'Tap to add a photo'}
                    </span>
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
            })}
          </>
        )}

        {error && <p className="form-error register-error">{error}</p>}

        <div className="register-actions">
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            {step === 0 ? 'Log out' : 'Back'}
          </button>
          <button type="submit" className="btn btn-primary">
            {step < 2 ? 'Continue' : 'Submit application'}
          </button>
        </div>
      </form>
    </div>
  );
}