import { useEffect } from 'react';

// Keeps the phone screen on while active, so the page doesn't pause and miss requests.
// Works on Chrome for Android and on iPhones with iOS 16.4 or newer.
export function useWakeLock(active) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let lock = null;
    let stopped = false;

    const request = async () => {
      try {
        lock = await navigator.wakeLock.request('screen');
      } catch {
        // Not allowed right now (e.g. low battery mode); the page still works.
      }
    };

    // The browser releases the lock when the rider switches apps, so ask again on return.
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !stopped) request();
    };

    request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      document.removeEventListener('visibilitychange', onVisible);
      lock?.release().catch(() => {});
    };
  }, [active]);
}