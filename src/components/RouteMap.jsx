import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_CENTER, TILE_URL, TILE_ATTRIBUTION, pinIcon, riderIcon } from './mapIcons';

const isPoint = (m) => m && Number.isFinite(m.lat) && Number.isFinite(m.lng);

// Zooms to show the store and customer pins. The rider's dot moves without re-zooming the map.
function FitToPins({ points }) {
  const map = useMap();
  const key = points.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join('|');
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) map.setView([points[0].lat, points[0].lng], 16);
    else map.fitBounds(points.map((p) => [p.lat, p.lng]), { padding: [40, 40], maxZoom: 17 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}

// markers: [{ id, kind: 'store' | 'customer' | 'rider', lat, lng, label }]
export default function RouteMap({ markers, height = '16rem' }) {
  const valid = markers.filter(isPoint);
  const pins = valid.filter((m) => m.kind !== 'rider');

  return (
    <div className="map-frame" style={{ height }}>
      <MapContainer center={DEFAULT_CENTER} zoom={13} scrollWheelZoom={false} className="map">
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <FitToPins points={pins.length > 0 ? pins : valid} />
        {valid.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={m.kind === 'rider' ? riderIcon() : pinIcon(m.kind)}>
            {m.label && <Tooltip direction="top">{m.label}</Tooltip>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}