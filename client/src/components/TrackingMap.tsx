import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useLocationTracking } from '@/hooks/use-location-tracking';
import 'leaflet/dist/leaflet.css';

interface TrackingMapProps {
  bookingId: number;
  initialPosition?: { lat: number; lng: number };
}

const defaultCenter = {
  lat: 29.7604,
  lng: -95.3698
};

const markerIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function TrackingMap({ 
  bookingId, 
  initialPosition = defaultCenter 
}: TrackingMapProps) {
  const { location, error, isConnected } = useLocationTracking(bookingId);
  const [position, setPosition] = useState(initialPosition);
  const mapRef = useRef(null);

  useEffect(() => {
    if (location) {
      setPosition({
        lat: Number(location.latitude),
        lng: Number(location.longitude)
      });
    }
  }, [location]);

  if (!isConnected) {
    return (
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden bg-background/80 flex items-center justify-center">
        <p className="text-foreground">Connecting to tracking service...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden bg-background/80 flex items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[position.lat, position.lng]} icon={markerIcon}>
          <Popup>
            Driver's current location<br/>
            Last updated: {new Date().toLocaleTimeString()}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
