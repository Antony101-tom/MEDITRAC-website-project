import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Uncontrolled-ish: reports the picked coordinates up via onChange, exactly
// like the vanilla version — no need to keep the whole map in React state.
export default function PharmacyLocationPicker({ onChange, height = '180px' }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current).setView([-1.2921, 36.8219], 12); // default: Nairobi CBD
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }
      onChange(lat, lng);
    });

    // Best-effort: recentre on the pharmacy's actual current location so most
    // pharmacies just fine-tune the pin instead of hunting for their area.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], 15),
        () => { /* denied/unavailable — keep the default Nairobi view */ }
      );
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [onChange]);

  return (
    <div>
      <div ref={containerRef} style={{ height, borderRadius: '8px', border: '1px solid #e2e8f0' }} />
      <small style={{ color: '#718096', fontSize: '0.78rem', marginTop: '2px', display: 'block' }}>
        Click the map to drop a pin at your pharmacy's exact spot — this is how patients will see how far they are from you.
      </small>
    </div>
  );
}
