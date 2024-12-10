import { useEffect, useRef, useState } from 'react';
import { useLocationTracking } from '@/hooks/use-location-tracking';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface LocationTrackerProps {
  bookingId: number;
  isActive: boolean;
}

export default function LocationTracker({ bookingId, isActive }: LocationTrackerProps) {
  const { updateLocation, connectionStatus, error } = useLocationTracking(bookingId);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number>();
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const startTracking = () => {
    if (!("geolocation" in navigator)) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setIsTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading } = position.coords;
        updateLocation(latitude, longitude, speed || undefined, heading || undefined);
      },
      (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = undefined;
    }
    setIsTracking(false);
  };

  if (!isActive) return null;

  return (
    <div className="flex items-center gap-4">
      <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'}>
        {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
      </Badge>
      {error && <Badge variant="destructive">{error}</Badge>}
      <Button
        onClick={isTracking ? stopTracking : startTracking}
        variant={isTracking ? "destructive" : "default"}
      >
        {isTracking ? "Stop Tracking" : "Start Tracking"}
      </Button>
    </div>
  );
}
