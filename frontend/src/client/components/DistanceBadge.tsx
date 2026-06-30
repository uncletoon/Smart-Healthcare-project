import { useState, useEffect } from "react";
import { Navigation } from "lucide-react";
import { calculateDistance } from "@/src/client/lib/locationUtils";

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        latitude: null,
        longitude: null,
        loading: false,
        error: "Geolocation is not supported by this browser.",
      });
      return;
    }

    const successHandler = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        loading: false,
        error: null,
      });
    };

    const errorHandler = (error: GeolocationPositionError) => {
      let errorMessage = "An unknown error occurred while retrieving location.";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location access denied by user.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage = "Request to get user location timed out.";
          break;
      }
      setState({
        latitude: null,
        longitude: null,
        loading: false,
        error: errorMessage,
      });
    };

    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  }, []);

  return state;
}

interface DistanceBadgeProps {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  className?: string;
}

/**
 * Reusable badge that displays the distance from the user's current location
 * to a given set of coordinates. Shows a loading dot while geolocation resolves,
 * and gracefully falls back to nothing if coordinates are unavailable.
 */
export default function DistanceBadge({
  latitude,
  longitude,
  className = "",
}: DistanceBadgeProps) {
  const { latitude: userLat, longitude: userLng, loading } = useGeolocation();

  // Don't render anything if the target has no coordinates
  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined
  ) {
    return null;
  }

  const distance = calculateDistance(userLat, userLng, latitude, longitude);

  return (
    <div
      className={`flex items-center gap-2 shrink-0 text-sm font-semibold px-3 py-1.5 rounded-full bg-secondary border border-primary/30 shadow-lg ${className}`}
      style={{
        boxShadow:
          "0 0 16px rgba(0, 77, 64, 0.35), 0 4px 8px rgba(0, 77, 64, 0.15)",
      }}
    >
      <Navigation className="w-4 h-4 text-primary" />
      {loading ? (
        <span className="text-gray-400 animate-pulse">…</span>
      ) : (
        <span className="text-primary">{distance}</span>
      )}
    </div>
  );
}
