import { useState, useEffect, useCallback } from 'react';

interface LocationState {
  lat: number;
  lon: number;
  accuracy: number;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geospatial tracking is not supported by this device hardware.');
      setLoading(false);
      return;
    }

    // Enforcing high accuracy for field-level precision
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        setError(`Secure location access denied or unavailable. Code: ${err.code}`);
        setLoading(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 // Force a fresh GPS ping, no cached locations
      }
    );
  }, []);

  // Auto-fetch location on component mount
  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return { location, loading, error, refreshLocation: fetchLocation };
};