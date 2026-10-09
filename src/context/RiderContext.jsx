import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { uploadPrivate } from '../utils/photos';
import { playChime } from '../utils/chime';
import { useLocationSharing } from '../utils/useLocationSharing';

const RiderContext = createContext(null);
const JOB_SELECT = '*, store:stores(name, address, town, phone, lat, lng), order_items(name, qty)';
const ACTIVE_STATUSES = ['preparing', 'ready', 'on_the_way'];
const POLL_MS = 15000;

function check(error, fallback) {
  if (error) throw new Error(error.message || fallback);
}

export function RiderProvider({ children }) {
  const { session, updateProfile } = useAuth();
  const userId = session?.user.id;

  const [rider, setRider] = useState(null);
  const [loadedFor, setLoadedFor] = useState(null);
  const [available, setAvailable] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [history, setHistory] = useState([]);
  const knownIds = useRef(new Set());
  const location = useLocationSharing(Boolean(activeJob));  

  const riderLoading = Boolean(userId) && loadedFor !== userId;
  const approved = rider?.status === 'approved';
  const online = Boolean(rider?.is_online);

  const loadRider = useCallback(async () => {
    if (!userId) {
      setRider(null);
      return;
    }
    const { data } = await supabase
      .from('riders')
      .select('*, rider_documents(doc_type, file_path)')
      .eq('id', userId)
      .maybeSingle();
    setRider(data ?? null);
    setLoadedFor(userId);
  }, [userId]);

  const loadJobs = useCallback(async () => {
    if (!userId || !approved) return;
    const [mine, done] = await Promise.all([
      supabase
        .from('orders')
        .select(JOB_SELECT)
        .eq('rider_id', userId)
        .in('status', ACTIVE_STATUSES)
        .order('created_at')
        .limit(1),
      supabase
        .from('orders')
        .select(JOB_SELECT)
        .eq('rider_id', userId)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false })
        .limit(100),
    ]);
    setActiveJob(mine.data?.[0] ?? null);
    setHistory(done.data ?? []);
  }, [userId, approved]);

  // Unclaimed orders from stores in the rider's town. The database security rules decide what's visible.
  const loadAvailable = useCallback(async () => {
    if (!userId || !approved || !online) {
      setAvailable([]);
      knownIds.current = new Set();
      return;
    }
    const { data } = await supabase
      .from('orders')
      .select(JOB_SELECT)
      .is('rider_id', null)
      .in('status', ['preparing', 'ready'])
      .order('created_at')
      .limit(20);
    const list = data ?? [];
    if (list.some((o) => !knownIds.current.has(o.id))) {
      playChime();
      navigator.vibrate?.(400); // Android only; iPhones ignore this
    }
    knownIds.current = new Set(list.map((o) => o.id));
    setAvailable(list);
  }, [userId, approved, online]);

  // Loading data from Supabase (an external system) is a valid use of an effect.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRider();
  }, [loadRider]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAvailable();
  }, [loadAvailable]);

  // Live updates when stores accept orders or mark them ready, plus a check every 15 seconds
  // in case another rider claimed an order (those changes aren't always sent live).
  useEffect(() => {
    if (!userId || !approved) return;
    const refresh = () => {
      loadJobs();
      loadAvailable();
    };
    const channel = supabase
      .channel(`rider-orders-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, refresh)
      .subscribe();
    const timer = setInterval(refresh, POLL_MS);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, [userId, approved, loadJobs, loadAvailable]);

  // Uploads documents first, then creates the rider application (always "pending" until an admin approves).
  const registerRider = async ({ fullName, phone, town, vehicle, plate, docs }) => {
    const uploaded = [];
    for (const [docType, file] of Object.entries(docs)) {
      const path = await uploadPrivate('rider-documents', userId, file, docType);
      uploaded.push({ rider_id: userId, doc_type: docType, file_path: path });
    }
    await updateProfile({ full_name: fullName, phone });
    const { error } = await supabase.from('riders').insert({ id: userId, town, vehicle, plate });
    check(error, 'Could not submit your application.');
    const { error: docError } = await supabase
      .from('rider_documents')
      .upsert(uploaded, { onConflict: 'rider_id,doc_type' });
    check(docError, 'Your application was saved, but the documents could not be attached.');
    await loadRider();
  };

  const toggleOnline = async (value) => {
    const { data, error } = await supabase
      .from('riders')
      .update({ is_online: value })
      .eq('id', userId)
      .select('*, rider_documents(doc_type, file_path)')
      .single();
    check(error, 'Could not change your status.');
    setRider(data);
  };

  const claimOrder = async (orderId) => {
    const { error } = await supabase.rpc('rider_claim_order', { p_order_id: orderId });
    check(error, 'Could not accept this delivery.');
    await Promise.all([loadJobs(), loadAvailable()]);
  };

  const pickUp = async (orderId) => {
    const { error } = await supabase.rpc('rider_update_order', { p_order_id: orderId, p_action: 'picked_up' });
    check(error, 'Could not update the delivery.');
    await loadJobs();
  };

  const completeDelivery = async (orderId, proofFile) => {
    const path = await uploadPrivate('delivery-proofs', userId, proofFile, 'proof');
    const { error } = await supabase.rpc('rider_update_order', {
      p_order_id: orderId,
      p_action: 'delivered',
      p_proof_path: path,
    });
    check(error, 'Could not complete the delivery.');
    await Promise.all([loadJobs(), loadAvailable()]);
  };

  return (
    <RiderContext.Provider
      value={{
        rider,
        riderLoading,
        available,
        activeJob,
        history,
        registerRider,
        toggleOnline,
        claimOrder,
        pickUp,
        completeDelivery,
        reloadRider: loadRider,
        myLocation: location.position,
        locationStatus: location.status,        
      }}
    >
      {children}
    </RiderContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRider = () => useContext(RiderContext);