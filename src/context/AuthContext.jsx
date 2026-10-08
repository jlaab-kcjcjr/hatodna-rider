import { createContext, useContext, useEffect, useState } from 'react';
import { DEMO_OTP, SAMPLE_JOBS, RIDER_SHARE, DELIVERY_STEPS } from '../data/riderData';
import { playChime } from '../utils/chime';

const STORAGE_KEY = 'hatodna-rider-v1';
const OFFER_DELAY_MS = 6000;

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [saved] = useState(loadSaved);
  const [pendingPhone, setPendingPhone] = useState(saved?.pendingPhone ?? '');
  const [user, setUser] = useState(saved?.user ?? null);
  const [application, setApplication] = useState(saved?.application ?? null);
  const [online, setOnline] = useState(saved?.online ?? false);
  const [activeJob, setActiveJob] = useState(saved?.activeJob ?? null);
  const [history, setHistory] = useState(saved?.history ?? []);
  const [offer, setOffer] = useState(null);

  // Demo only: keeps everything after a refresh. Later, the backend stores this.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ pendingPhone, user, application, online, activeJob, history })
      );
    } catch {
      // Storage is full or blocked; the app still works for this visit.
    }
  }, [pendingPhone, user, application, online, activeJob, history]);

  // Later: call the backend here, which sends a real SMS.
  const requestOtp = (phone) => setPendingPhone(phone);

  const verifyOtp = (code) => {
    if (code !== DEMO_OTP) return false;
    setUser({ phone: pendingPhone });
    return true;
  };

  // Later: upload this to the backend so admins can review it in the dashboard.
  const submitApplication = (data) => setApplication({ ...data, status: 'pending', submittedAt: Date.now() });

  // Demo only: in the real system, an admin approves riders from the dashboard.
  const approveDemo = () => setApplication((a) => ({ ...a, status: 'approved' }));

  const toggleOnline = (value) => {
    setOnline(value);
    if (!value) setOffer(null);
  };

  // Demo only: send a sample request a few seconds after going online.
  useEffect(() => {
    if (!online || offer || activeJob || application?.status !== 'approved') return;
    const t = setTimeout(() => {
      const sample = SAMPLE_JOBS[Math.floor(Math.random() * SAMPLE_JOBS.length)];
      setOffer({
        ...sample,
        id: Date.now().toString(),
        earning: Math.round(sample.deliveryFee * RIDER_SHARE),
      });
      playChime();
      navigator.vibrate?.(400); // Android only; iPhones ignore this
    }, OFFER_DELAY_MS);
    return () => clearTimeout(t);
  }, [online, offer, activeJob, application]);

  const acceptOffer = () => {
    setActiveJob({ ...offer, step: 0, acceptedAt: Date.now() });
    setOffer(null);
  };

  const declineOffer = () => setOffer(null);

  const advanceJob = () => {
    if (!activeJob) return;
    if (activeJob.step < DELIVERY_STEPS.length - 1) {
      setActiveJob({ ...activeJob, step: activeJob.step + 1 });
      return;
    }
    // Later: the proof photo is uploaded to the backend. It isn't kept here to save storage.
    setHistory((prev) => [{ ...activeJob, completedAt: Date.now(), remitted: false }, ...prev]);
    setActiveJob(null);
  };

  const remitCash = () => setHistory((prev) => prev.map((j) => ({ ...j, remitted: true })));

  const logout = () => {
    setUser(null);
    setPendingPhone('');
    setApplication(null);
    setOnline(false);
    setOffer(null);
    setActiveJob(null);
    setHistory([]);
  };

  return (
    <AuthContext.Provider
      value={{
        pendingPhone,
        user,
        application,
        online,
        offer,
        activeJob,
        history,
        requestOtp,
        verifyOtp,
        submitApplication,
        approveDemo,
        toggleOnline,
        acceptOffer,
        declineOffer,
        advanceJob,
        remitCash,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);