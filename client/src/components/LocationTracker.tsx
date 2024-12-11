import { useEffect, useRef, useState } from 'react';
import { useLocationTracking } from '@/hooks/use-location-tracking';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LocationTrackerProps {
  bookingId: number;
  isActive: boolean;
}

export default function LocationTracker({ bookingId, isActive }: LocationTrackerProps) {
  const { updateLocation, connectionStatus, error } = useLocationTracking(bookingId);
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const watchIdRef = useRef<number>();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const cleanup = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = undefined;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  useEffect(() => {
    if (error) {
      setTrackingError(error);
      if (isTracking) {
        toast({
          title: "Connection Error",
          description: "Attempting to reconnect...",
          variant: "destructive",
        });
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isTracking) {
            stopTracking();
            startTracking();
          }
        }, 5000);
      }
    } else {
      setTrackingError(null);
    }
  }, [error]);

  const startTracking = () => {
    if (!("geolocation" in navigator)) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    cleanup(); // Clean up any existing tracking
    setIsLoading(true);
    setIsTracking(true);
    setTrackingError(null);

    // First get a single position to ensure everything works
    navigator.geolocation.getCurrentPosition(
      () => {
        // If successful, start continuous tracking
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed, heading } = position.coords;
            updateLocation(latitude, longitude, speed || undefined, heading || undefined);
            setIsLoading(false);
            setTrackingError(null);
          },
          (error) => {
            const errorMessage = `Location tracking error: ${error.message}`;
            setTrackingError(errorMessage);
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
            // Don't stop tracking immediately, let the reconnection logic handle it
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
        const errorMessage = `Could not get location: ${error.message}`;
        setTrackingError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        setIsTracking(false);
        setIsLoading(false);
      }
    );
  };

  const stopTracking = () => {
    cleanup();
    setIsTracking(false);
    setIsLoading(false);
    setTrackingError(null);
  };

  if (!isActive) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'}>
          {connectionStatus === 'connected' ? 'Connected' : 'Reconnecting...'}
        </Badge>
        {trackingError && <Badge variant="destructive">Error</Badge>}
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
      
      {trackingError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{trackingError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
