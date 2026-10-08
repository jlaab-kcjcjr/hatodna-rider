export const peso = (amount) => `₱${Number(amount).toLocaleString('en-PH')}`;

// Bikol greetings based on the time of day.
export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Marhay na aga';
  if (hour < 18) return 'Marhay na hapon';
  return 'Marhay na banggi';
}

export function formatDate(timestamp) {
  const d = new Date(timestamp);
  const date = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
  return `${date}, ${time}`;
}

export function initialsOf(text) {
  return (
    text
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('') || '?'
  );
}