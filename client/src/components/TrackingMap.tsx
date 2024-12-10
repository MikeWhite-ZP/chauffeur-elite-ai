import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocationTracking } from '@/hooks/use-location-tracking';
import { Icon, LatLngTuple } from 'leaflet';

// Fix for default marker icon in react-leaflet
const defaultIcon = new Icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface TrackingMapProps {
  bookingId: number;
  initialPosition?: LatLngTuple;
}

function MapUpdater({ position }: { position: LatLngTuple }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [map, position]);
  
  return null;
}

export default function TrackingMap({ bookingId, initialPosition = [29.7604, -95.3698] }: TrackingMapProps) {
  const { location, error, isConnected } = useLocationTracking(bookingId);
  const [position, setPosition] = useState<LatLngTuple>(initialPosition);

  useEffect(() => {
    if (location) {
      setPosition([location.latitude, location.longitude]);
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
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} icon={defaultIcon} />
        <MapUpdater position={position} />
      </MapContainer>
    </div>
  );
}
