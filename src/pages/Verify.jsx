import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BanigBand from '../components/BanigBand';

const LENGTH = 6;
const RESEND_SECONDS = 60;

export default function Verify() {
  const { session, pendingEmail, verifyOtp, requestOtp } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (seconds === 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  if (session) return <Navigate to="/" replace />;
  if (!pendingEmail) return <Navigate to="/login" replace />;

  // When the code is right, Supabase logs the customer in and the page switches to Home.
  const verify = async (value) => {
    if (value.length < LENGTH) {
      setError('Enter all 6 digits of the code.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await verifyOtp(value);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const onChange = (e) => {
    const next = e.target.value.replace(/\D/g, '').slice(0, LENGTH);
    setCode(next);
    setError('');
    if (next.length === LENGTH) verify(next);
  };

  const onResend = async () => {
    setError('');
    setNotice('');
    try {
      await requestOtp(pendingEmail);
      setSeconds(RESEND_SECONDS);
      setCode('');
      setNotice('A new code is on its way.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="verify">
      <form
        className="auth-form"
        onSubmit={(e) => {
          e.preventDefault();
          verify(code);
        }}
      >
        <h1>Check your email</h1>
        <p className="muted">
          We sent a 6-digit code to <strong>{pendingEmail}</strong>. If you don't see it, check your Spam or Promotions
          folder.
        </p>
        <input
          className={`otp-input${error ? ' has-error' : ''}`}
          value={code}
          onChange={onChange}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={LENGTH}
          placeholder="••••••"
          aria-label="6-digit code"
          disabled={busy}
        />
        {error && <p className="form-error">{error}</p>}
        {notice && <p className="muted small">{notice}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Checking...' : 'Verify and continue'}
        </button>
        <button type="button" className="link-btn center" disabled={seconds > 0} onClick={onResend}>
          {seconds > 0 ? `Resend code in ${seconds}s` : 'Resend code'}
        </button>
        <Link to="/login" className="link small center">
          Use a different email
        </Link>
      </form>
      <div className="verify-band">
        <BanigBand id="verify-band" height={10} />
      </div>
    </div>
  );
}