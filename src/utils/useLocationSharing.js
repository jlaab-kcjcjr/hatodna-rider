import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

const SEND_EVERY_MS = 15000;

// While a delivery is active, follows the phone's GPS and shares the position every 15 seconds.
// It only works while HatodNa is open on screen; the screen stays on during deliveries for this reason.
export function useLocationSharing(active) {
  const [position, setPosition] = useState(null);
  const [status, setStatus] = useState('waiting'); // waiting, sharing, denied, unavailable
  const lastSent = useRef(0);

  useEffect(() => {
    if (!active || !('geolocation' in navigator)) return;
    lastSent.current = 0;

    const onPosition = (pos) => {
      const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setPosition(point);
      setStatus('sharing');
      const now = Date.now();
      if (now - lastSent.current < SEND_EVERY_MS) return;
      lastSent.current = now;
      supabase.rpc('rider_update_location', { p_lat: point.lat, p_lng: point.lng }).then(({ error }) => {
        if (error) console.error('Could not share location:', error.message);
      });
    };

    const onError = (err) => setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable');

    const watchId = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 30000,
    });
    return () => navigator.geolocation.clearWatch(watchId);
  }, [active]);

  if (!active) return { position: null, status: 'off' };
  if (!('geolocation' in navigator)) return { position: null, status: 'unavailable' };
  return { position, status };
}