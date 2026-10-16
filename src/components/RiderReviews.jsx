import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

const day = (iso) => new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });

// Rider profile: star average and what customers said (without customer names).
export default function RiderReviews({ riderId }) {
  const [result, setResult] = useState({ riderId: null, summary: null, list: [] });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      supabase.rpc('rider_rating_summary', { p_rider_id: riderId }),
      supabase.rpc('my_rider_reviews'),
    ]).then(([summary, list]) => {
      if (!cancelled) setResult({ riderId, summary: summary.data?.[0] ?? null, list: list.data ?? [] });
    });
    return () => {
      cancelled = true;
    };
  }, [riderId]);

  if (result.riderId !== riderId) return null;
  const total = Number(result.summary?.total ?? 0);

  return (
    <section className="panel reviews">
      <div className="reviews-head">
        <p className="reviews-title">Customer ratings</p>
        {total > 0 ? (
          <p className="reviews-avg">
            <Star size={18} aria-hidden="true" />
            {Number(result.summary.average).toFixed(1)}
            <span className="muted small">
              {' '}
              from {total} {total === 1 ? 'rating' : 'ratings'}
            </span>
          </p>
        ) : (
          <p className="muted small">No ratings yet. Customers can rate you after each delivery.</p>
        )}
      </div>

      {result.list.length > 0 && (
        <ul className="reviews-list">
          {result.list.map((r, i) => (
            <li key={`${r.created_at}-${i}`}>
              <p className="reviews-stars" aria-label={`${r.stars} out of 5 stars`}>
                {'★'.repeat(r.stars)}
                <span className="reviews-off">{'★'.repeat(5 - r.stars)}</span>
                <span className="muted small"> · {day(r.created_at)}</span>
              </p>
              {r.tags?.length > 0 && <p className="muted small">{r.tags.join(' · ')}</p>}
              {r.comment && <p className="reviews-comment">“{r.comment}”</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}