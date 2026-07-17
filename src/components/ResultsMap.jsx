import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { escapeHtml } from '../utils/geo';

// byPharmacy: Map<pharmacyName, { coords: {lat,lng}, distanceKm: number|null, meds: [...] }>
export default function ResultsMap({ byPharmacy, userLoc, onTrack }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Create the map once.
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = L.map(containerRef.current).setView([-1.2921, 36.8219], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    // Popups contain a plain button whose click we can't wire with React
    // props (Leaflet renders that HTML outside React's tree), so we expose
    // the track handler on window for the popup's inline onclick to call.
    window.__meditracTrack = onTrack;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the global track handler current across re-renders.
  useEffect(() => {
    window.__meditracTrack = onTrack;
  }, [onTrack]);

  // Redraw pins whenever the results or the user's location change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    setTimeout(() => map.invalidateSize(), 0);

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    const bounds = [];

    byPharmacy.forEach((info, pharmacyName) => {
      const marker = L.marker([info.coords.lat, info.coords.lng]).addTo(map);
      const distText = info.distanceKm !== null ? `${info.distanceKm.toFixed(1)} km away` : 'Distance unknown';
      const medsHtml = info.meds
        .map(
          (med) => `
            <div style="margin-top:6px;">
              ${escapeHtml(med.name)} — KES ${Number(med.price).toLocaleString()}
              <button onclick="window.__meditracTrack && window.__meditracTrack('${med.id}')" style="margin-left:6px;padding:3px 8px;border:none;border-radius:6px;background:#2b6cb0;color:#fff;font-size:0.75rem;cursor:pointer;">Track</button>
            </div>`
        )
        .join('');
      marker.bindPopup(`<strong>${escapeHtml(pharmacyName)}</strong><br><span style="color:#718096;">${distText}</span>${medsHtml}`);
      markersRef.current.push(marker);
      bounds.push([info.coords.lat, info.coords.lng]);
    });

    if (userLoc) {
      const me = L.circleMarker([userLoc.lat, userLoc.lng], {
        radius: 8,
        color: '#e53e3e',
        fillColor: '#e53e3e',
        fillOpacity: 0.9,
      })
        .addTo(map)
        .bindPopup('Your location');
      markersRef.current.push(me);
      bounds.push([userLoc.lat, userLoc.lng]);
    }

    if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [byPharmacy, userLoc]);

  return <div ref={containerRef} style={{ height: '320px', borderRadius: '12px' }} />;
}
