import { Camera, CircleCheck } from 'lucide-react';

const TIPS = [
  'Face the camera with your eyes open',
  'Stand in good light, with no shadows on your face',
  'No helmet, cap, sunglasses, or face mask',
  'Only you in the photo',
];

// Big selfie circle for sign-up and resubmission. Opens the front camera on phones.
export default function SelfieCapture({ preview, existingUrl, onPick }) {
  const src = preview || existingUrl;

  return (
    <section className="selfie">
      <p className="selfie-title">
        Selfie <span className="doc-tag required">Required</span>
      </p>
      <p className="muted small">We compare it with your ID, and customers see it so they know who's delivering.</p>

      <label className={`selfie-frame${src ? ' has-photo' : ''}`}>
        {src ? (
          <img src={src} alt="Your selfie" />
        ) : (
          <>
            <span className="selfie-guide" aria-hidden="true" />
            <span className="selfie-empty">
              <Camera size={28} aria-hidden="true" />
              Tap to take a selfie
            </span>
          </>
        )}
        <input type="file" accept="image/*" capture="user" onChange={onPick} hidden />
      </label>

      {src && (
        <p className="selfie-ok">
          <CircleCheck size={18} aria-hidden="true" />
          {preview ? 'Selfie added.' : 'Selfie on file.'} Tap the photo to retake it.
        </p>
      )}

      <ul className="selfie-tips">
        {TIPS.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </section>
  );
}