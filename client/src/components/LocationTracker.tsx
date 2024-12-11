import { useEffect, useRef, useState } from 'react';
import { useLocationTracking } from '@/hooks/use-location-tracking';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface LocationTrackerProps {
  bookingId: number;
  isActive: boolean;
}

export default function LocationTracker({ bookingId, isActive }: LocationTrackerProps) {
  const { updateLocation, connectionStatus, error } = useLocationTracking(bookingId);
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);
    setIsTracking(true);

    // First get a single position to ensure everything works
    navigator.geolocation.getCurrentPosition(
      () => {
        // If successful, start continuous tracking
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed, heading } = position.coords;
            updateLocation(latitude, longitude, speed || undefined, heading || undefined);
            setIsLoading(false);
          },
          (error) => {
            toast({
              title: "Error",
              description: `Location tracking error: ${error.message}`,
              variant: "destructive",
            });
            setIsTracking(false);
            setIsLoading(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      },
      (error) => {
        toast({
          title: "Error",
          description: `Could not get location: ${error.message}`,
          variant: "destructive",
        });
        setIsTracking(false);
        setIsLoading(false);
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = undefined;
    }
    setIsTracking(false);
    setIsLoading(false);
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
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Initializing...
          </span>
        ) : isTracking ? (
          "Stop Tracking"
        ) : (
          "Start Tracking"
        )}
      </Button>
    </div>
  );
}
