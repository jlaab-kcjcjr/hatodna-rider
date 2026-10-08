import React, { createContext, useContext, useEffect, useState } from 'react';
import { SAMPLE_JOBS, RIDER_SHARE } from '../data/sampleJobs';

// Demo only. Once the backend exists, a real code is sent by SMS.
export const DEMO_OTP = '123456';

export const DELIVERY_STEPS = [
  { title: 'Head to the store', action: "I'm at the store" },
  { title: 'Pick up the order', action: 'Order picked up' },
  { title: 'Deliver to the customer', action: "I'm at the customer" },
  { title: 'Collect payment and hand over', action: 'Complete delivery' },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [pendingPhone, setPendingPhone] = useState('');
  const [user, setUser] = useState(null);
  const [application, setApplication] = useState(null);
  const [online, setOnline] = useState(false);
  const [offer, setOffer] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [history, setHistory] = useState([]);

  const requestOtp = (phone) => setPendingPhone(phone);

  const verifyOtp = (code) => {
    if (code !== DEMO_OTP) return false;
    setUser({ phone: pendingPhone });
    return true;
  };

  // Later: upload this to the backend so admins can review it in the dashboard.
  const submitApplication = (data) =>
    setApplication({ ...data, status: 'pending', submittedAt: Date.now() });

  // Demo only: in the real system, an admin approves riders from the dashboard.
  const approveDemo = () => setApplication((a) => ({ ...a, status: 'approved' }));

  const toggleOnline = (value) => {
    setOnline(value);
    if (!value) setOffer(null);
  };

  // Demo only: send a sample request a few seconds after going online.
  useEffect(() => {
    if (!online || offer || activeJob) return;
    const t = setTimeout(() => {
      const sample = SAMPLE_JOBS[Math.floor(Math.random() * SAMPLE_JOBS.length)];
      setOffer({
        ...sample,
        id: Date.now().toString(),
        earning: Math.round(sample.deliveryFee * RIDER_SHARE),
      });
    }, 6000);
    return () => clearTimeout(t);
  }, [online, offer, activeJob]);

  const acceptOffer = () => {
    setActiveJob({ ...offer, step: 0, acceptedAt: Date.now() });
    setOffer(null);
  };

  const declineOffer = () => setOffer(null);

  const advanceJob = (extra = {}) => {
    if (!activeJob) return;
    const job = { ...activeJob, ...extra };
    if (job.step < DELIVERY_STEPS.length - 1) {
      setActiveJob({ ...job, step: job.step + 1 });
      return;
    }
    setHistory((prev) => [{ ...job, completedAt: Date.now(), remitted: false }, ...prev]);
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

export const useAuth = () => useContext(AuthContext);