import { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
}

interface BookingFormMapProps {
  pickupLocation: string;
  dropoffLocation: string;
  stops?: string[];
  className?: string;
}

const defaultCenter = {
  lat: 29.7604,
  lng: -95.3698
};

export default function BookingFormMap({
  pickupLocation,
  dropoffLocation,
  stops = [],
  className = "w-full h-[400px] rounded-lg overflow-hidden"
}: BookingFormMapProps) {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const debug = import.meta.env.VITE_DEBUG === 'true';

  useEffect(() => {
    if (!pickupLocation || !dropoffLocation) return;

    const geocoder = new google.maps.Geocoder();
    const waypoints = stops.map(stop => ({ location: stop, stopover: true }));

    const directionsService = new google.maps.DirectionsService();

    Promise.all([
      new Promise<google.maps.LatLng>((resolve, reject) => {
        geocoder.geocode({ address: pickupLocation }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            resolve(results[0].geometry.location);
          } else {
            reject(new Error('Failed to geocode pickup location'));
          }
        });
      }),
      new Promise<google.maps.LatLng>((resolve, reject) => {
        geocoder.geocode({ address: dropoffLocation }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            resolve(results[0].geometry.location);
          } else {
            reject(new Error('Failed to geocode dropoff location'));
          }
        });
      })
    ]).then(([origin, destination]) => {
      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true
        },
        (result, status) => {
          if (status === 'OK') {
            setDirections(result);
            setError(null);
          } else {
            setError('Failed to calculate route');
            if (debug) {
              console.error('Directions request failed:', status);
            }
          }
          setIsLoading(false);
        }
      );
    }).catch(err => {
      setError(err.message);
      setIsLoading(false);
      if (debug) {
        console.error('Error calculating route:', err);
      }
    });
  }, [pickupLocation, dropoffLocation, stops, debug]);

  if (error) {
    return (
      <div className={`${className} bg-destructive/10 flex items-center justify-center`}>
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} loadingElement={
      <div className={`${className} bg-background/80 flex items-center justify-center`}>
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <GoogleMap
        mapContainerClassName={className}
        center={defaultCenter}
        zoom={12}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
        }}
      >
        {isLoading ? (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          directions && <DirectionsRenderer directions={directions} />
        )}
      </GoogleMap>
    </LoadScript>
  );
}
