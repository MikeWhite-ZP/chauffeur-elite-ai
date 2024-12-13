import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Ensure Leaflet's default icon images are properly loaded
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

interface BookingFormMapProps {
  pickupLocation: string;
  dropoffLocation: string;
  stops?: string[];
  className?: string;
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
function MapUpdater({ position }: { position: { lat: number; lng: number } }) {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo([position.lat, position.lng], map.getZoom());
  }, [map, position]);

  return null;
}

export default function BookingFormMap({ 
  pickupLocation, 
  dropoffLocation, 
  stops = [], 
  className = "w-full h-[400px] rounded-lg overflow-hidden"
}: BookingFormMapProps) {
  const [markers, setMarkers] = useState<Array<{ position: [number, number], label: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [center, setCenter] = useState(defaultCenter);

  useEffect(() => {
    const geocodeAddress = async (address: string) => {
      try {
        // Using OpenStreetMap's Nominatim service for geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }
        const data = await response.json();
        if (data && data[0]) {
          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          };
        }
        console.warn(`No location found for address: ${address}`);
        return null;
      } catch (error) {
        console.error('Geocoding error:', error);
        return null;
      }
    };

    const updateMarkers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const newMarkers: Array<{ position: [number, number], label: string }> = [];
        
        if (pickupLocation) {
          const pickup = await geocodeAddress(pickupLocation);
          if (pickup) {
            newMarkers.push({
              position: [pickup.lat, pickup.lng],
              label: 'Pickup'
            });
            setCenter(pickup);
          }
        }

        if (dropoffLocation) {
          const dropoff = await geocodeAddress(dropoffLocation);
          if (dropoff) {
            newMarkers.push({
              position: [dropoff.lat, dropoff.lng],
              label: 'Dropoff'
            });
          }
        }

        for (const stop of stops) {
          const stopLocation = await geocodeAddress(stop);
          if (stopLocation) {
            newMarkers.push({
              position: [stopLocation.lat, stopLocation.lng],
              label: 'Stop'
            });
          }
        }

        setMarkers(newMarkers);
      } catch (err) {
        setError('Failed to load locations on map');
        console.error('Error updating markers:', err);
      } finally {
        setIsLoading(false);
      }
    };

    updateMarkers();
  }, [pickupLocation, dropoffLocation, stops]);

  if (error) {
    return (
      <div className={`${className} bg-destructive/10 flex items-center justify-center`}>
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${className} bg-background/80 flex items-center justify-center`}>
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      className={className}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {markers.map((marker, index) => (
        <Marker key={index} position={marker.position}>
          <Popup>{marker.label}</Popup>
        </Marker>
      ))}
      <MapUpdater position={center} />
    </MapContainer>
  );
}
