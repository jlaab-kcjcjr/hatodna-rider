import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { BRAND } from '../theme';
import { useAuth } from '../context/AuthContext';
import MayonMark from '../components/MayonMark';
import BanigBand from '../components/BanigBand';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { session, requestOtp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (session) return <Navigate to="/" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(value)) {
      setError('Enter a valid email address, like juan@gmail.com.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await requestOtp(value);
      navigate('/verify');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <section className="auth-hero">
        <div className="auth-hero-inner">
          <p className="auth-brand">{BRAND.name}</p>
          <p className="auth-tagline">{BRAND.tagline}</p>
        </div>
        <div className="auth-mayon">
          <MayonMark />
        </div>
        <div className="auth-band">
          <BanigBand id="login-band" height={14} />
        </div>
      </section>

      <form className="auth-form" onSubmit={onSubmit}>
        <h1>Log in with your email</h1>
        <label className="field">
          <span>Email address</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="juan@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            className={error ? 'has-error' : ''}
          />
        </label>
        {error ? (
          <p className="form-error">{error}</p>
        ) : (
          <p className="muted small">We'll email you a 6-digit code. New here? Your account is created automatically.</p>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Sending code...' : 'Send code'}
        </button>
        <Link to="/install" className="link small center">
          How to add HatodNa to your phone
        </Link>
      </form>
    </div>
  );
}