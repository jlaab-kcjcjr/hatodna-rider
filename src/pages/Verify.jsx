import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEMO_OTP } from '../data/riderData';
import BanigBand from '../components/BanigBand';

const LENGTH = 6;

export default function Verify() {
  const { user, pendingPhone, verifyOtp, requestOtp } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (seconds === 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  if (user) return <Navigate to="/" replace />;
  if (!pendingPhone) return <Navigate to="/login" replace />;

  // When the code is right, the user is saved and the page switches to Home on its own.
  const verify = (value) => {
    if (value.length < LENGTH) {
      setError('Enter all 6 digits of the code.');
      return;
    }
    if (!verifyOtp(value)) setError('That code is incorrect. Check the SMS and try again.');
  };

  const onChange = (e) => {
    const next = e.target.value.replace(/\D/g, '').slice(0, LENGTH);
    setCode(next);
    setError('');
    if (next.length === LENGTH) verify(next);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    verify(code);
  };

  const onResend = () => {
    requestOtp(pendingPhone);
    setSeconds(30);
    setCode('');
  };

  return (
    <div className="verify">
      <form className="auth-form" onSubmit={onSubmit}>
        <h1>Enter the code</h1>
        <p className="muted">We sent a 6-digit code to {pendingPhone}.</p>
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
        />
        {error && <p className="form-error">{error}</p>}
        <p className="muted small">Demo mode: use code {DEMO_OTP}</p>
        <button type="submit" className="btn btn-primary btn-block">
          Verify and continue
        </button>
        <button type="button" className="link-btn center" disabled={seconds > 0} onClick={onResend}>
          {seconds > 0 ? `Resend code in ${seconds}s` : 'Resend code'}
        </button>
        <Link to="/login" className="link small center">
          Use a different number
        </Link>
      </form>
      <div className="verify-band">
        <BanigBand id="verify-band" height={10} />
      </div>
    </div>
  );
}