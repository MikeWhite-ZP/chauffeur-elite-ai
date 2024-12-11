import { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useLocationTracking } from '@/hooks/use-location-tracking';

interface TrackingMapProps {
  bookingId: number;
  initialPosition?: { lat: number; lng: number };
}

const containerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: 29.7604,
  lng: -95.3698
};

export default function TrackingMap({ 
  bookingId, 
  initialPosition = defaultCenter 
}: TrackingMapProps) {
  const { location, error, isConnected } = useLocationTracking(bookingId);
  const [position, setPosition] = useState(initialPosition);

  useEffect(() => {
    if (location) {
      setPosition({
        lat: Number(location.latitude),
        lng: Number(location.longitude)
      });
    }
  }, [location]);

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
      {!isConnected && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <p className="text-foreground">Connecting to tracking service...</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <p className="text-destructive">{error}</p>
        </div>
      )}
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={position}
          zoom={13}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          <Marker
            position={position}
            icon={{
              url: '/car-marker.png',
              scaledSize: new window.google.maps.Size(32, 32),
            }}
          />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
