import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);
const PENDING_KEY = 'hatodna-rider-pending-email';

function readPendingEmail() {
  try {
    return sessionStorage.getItem(PENDING_KEY) ?? '';
  } catch {
    return '';
  }
}

function friendlyOtpError(error) {
  const message = error?.message ?? '';
  if (message.toLowerCase().includes('rate limit')) return 'Too many codes were sent. Please wait a few minutes and try again.';
  if (message.includes('security purposes')) return 'Please wait a minute before asking for another code.';
  return message || 'We could not send the code. Please try again.';
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState(readPendingEmail);
  const userId = session?.user.id;

  const loadProfile = async (id) => {
    if (!id) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    setProfile(data ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadProfile(data.session?.user.id);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      // Supabase recommends not calling the database directly inside this callback.
      setTimeout(() => loadProfile(newSession?.user.id), 0);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Sends a 6-digit code. The first login creates the account with the rider role.
  const requestOtp = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, data: { role: 'rider' } },
    });
    if (error) throw new Error(friendlyOtpError(error));
    setPendingEmail(email);
    try {
      sessionStorage.setItem(PENDING_KEY, email);
    } catch {
      // Storage blocked; the code still works during this visit.
    }
  };

  const verifyOtp = async (code) => {
    const { error } = await supabase.auth.verifyOtp({ email: pendingEmail, token: code, type: 'email' });
    if (error) throw new Error('That code is incorrect or has expired. Check your email and try again.');
    try {
      sessionStorage.removeItem(PENDING_KEY);
    } catch {
      // Ignore.
    }
  };

  const updateProfile = async (changes) => {
    const { data, error } = await supabase.from('profiles').update(changes).eq('id', userId).select().single();
    if (error) throw new Error('Could not save your details. Please try again.');
    setProfile(data);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, profile, loading, pendingEmail, requestOtp, verifyOtp, updateProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);