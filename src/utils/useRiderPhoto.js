import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// The rider's selfie as a short-lived private link (the photo stays in private storage).
export function useRiderPhoto(rider) {
  const path = rider?.rider_documents?.find((d) => d.doc_type === 'selfie')?.file_path ?? '';
  const [result, setResult] = useState({ path: '', url: '' });

  useEffect(() => {
    if (!path) return undefined;
    let cancelled = false;
    supabase.storage
      .from('rider-documents')
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        if (!cancelled) setResult({ path, url: data?.signedUrl ?? '' });
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return result.path === path ? result.url : '';
}