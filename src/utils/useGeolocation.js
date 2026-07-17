import { useEffect, useState } from 'react';

// Best-effort: returns { lat, lng } once the browser grants access, otherwise
// stays null forever (denied, unsupported, etc). Callers should treat null as
// "distance features unavailable", not as an error to surface to the user.
export default function useGeolocation() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        /* denied/unavailable — features that need it just degrade gracefully */
      }
    );
  }, []);

  return location;
}
