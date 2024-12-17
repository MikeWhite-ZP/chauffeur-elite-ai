import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useLocationTracking } from '@/hooks/use-location-tracking';
import { Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Ensure Leaflet's default icon images are properly loaded
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

interface TrackingMapProps {
  bookingId: number;
  initialPosition?: { lat: number; lng: number };
  showRoute?: boolean;
  destination?: { lat: number; lng: number };
}

const defaultCenter = {
  lat: 29.7604, // Houston coordinates
  lng: -95.3698
};

// Fix Leaflet's default icon path issues
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map center updates with smooth animation
function MapUpdater({ position, animate = true }: { position: { lat: number; lng: number }, animate?: boolean }) {
  const map = useMap();
  
  const updatePosition = useCallback(() => {
    if (animate) {
      map.flyTo([position.lat, position.lng], map.getZoom(), {
        duration: 2
      });
    } else {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [map, position, animate]);

  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

  return null;
}

export default function TrackingMap({ 
  bookingId, 
  initialPosition = defaultCenter 
}: TrackingMapProps) {
  const { location, error, isConnected } = useLocationTracking(bookingId);
  const [position, setPosition] = useState(initialPosition);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (location) {
      const newPosition = {
        lat: Number(location.latitude),
        lng: Number(location.longitude)
      };
      
      setPosition(newPosition);
      setLastUpdate(new Date());

      // Log position updates for debugging
      console.log('Vehicle position updated:', {
        position: newPosition,
        timestamp: new Date().toISOString(),
        booking: bookingId
      });
    }
  }, [location, bookingId]);

  // Custom vehicle icon
  const vehicleIcon = new Icon({
    iconUrl: '/vehicle-marker.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

  const MapPlaceholder = ({ message }: { message: string }) => (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden bg-background/80 flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-foreground text-center px-4">{message}</p>
    </div>
  );

  if (!isConnected) {
    return <MapPlaceholder message="Establishing connection to tracking service..." />;
  }

  if (error) {
    return (
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden bg-destructive/10 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-destructive font-semibold mb-2">Connection Error</p>
          <p className="text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  // Check if TomTom API key is configured
  if (!import.meta.env.VITE_TOMTOM_API_KEY) {
    return (
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden bg-destructive/10 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-destructive font-semibold mb-2">Configuration Error</p>
          <p className="text-destructive/80">TomTom API key is not configured.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          url={`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${import.meta.env.VITE_TOMTOM_API_KEY}`}
          attribution='&copy; <a href="https://www.tomtom.com">TomTom</a>'
          maxZoom={22}
        />
        <Marker position={[position.lat, position.lng]}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold mb-1">Driver's Location</p>
              <p className="text-gray-600">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </Popup>
        </Marker>
        <MapUpdater position={position} />
      </MapContainer>
    </div>
  );
}
