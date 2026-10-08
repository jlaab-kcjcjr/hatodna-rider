import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { BRAND } from '../theme';
import { useAuth } from '../context/AuthContext';
import MayonMark from '../components/MayonMark';
import BanigBand from '../components/BanigBand';

export default function Login() {
  const { user, requestOtp } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  const onChange = (e) => {
    let digits = e.target.value.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = digits.slice(1); // accept 0917... too
    setPhone(digits.slice(0, 10));
    setError('');
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!/^9\d{9}$/.test(phone)) {
      setError('Enter a valid mobile number, like 917 123 4567.');
      return;
    }
    requestOtp(`+63${phone}`);
    navigate('/verify');
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
        <h1>Log in with your mobile number</h1>
        <div className={`phone-field${error ? ' has-error' : ''}`}>
          <span className="phone-prefix">+63</span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="917 123 4567"
            value={phone}
            onChange={onChange}
            aria-label="Mobile number"
          />
        </div>
        {error ? (
          <p className="form-error">{error}</p>
        ) : (
          <p className="muted small">We'll text you a 6-digit code to confirm it's you.</p>
        )}
        <button type="submit" className="btn btn-primary btn-block">
          Send code
        </button>
        <Link to="/install" className="link small center">
          How to add HatodNa to your phone
        </Link>
      </form>
    </div>
  );
}