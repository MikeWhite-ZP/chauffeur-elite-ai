import { useState, useEffect, useCallback } from 'react';
import { useUser } from './use-user';

interface LocationUpdate {
  bookingId: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
}

export function useLocationTracking(bookingId?: number) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [location, setLocation] = useState<LocationUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user || !bookingId) return;

    let websocket: WebSocket | null = null;
    const connectWebSocket = () => {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
      websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        if (!websocket) return;
        websocket.send(JSON.stringify({
          type: 'init',
          userId: user.id,
          role: user.role
        }));

        websocket.send(JSON.stringify({
          type: 'subscribe_tracking',
          bookingId
        }));
      };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'location_update') {
          setLocation(data.data);
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };

    websocket.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError('Failed to connect to tracking service');
    };

    setWs(websocket);

    return () => {
      if (websocket) {
        websocket.close();
        websocket = null;
      }
    };
  }, [user, bookingId]);

  // Reconnect on connection loss
  useEffect(() => {
    const reconnectInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.CLOSED) {
        setWs(null);
      }
    }, 3000);

    return () => clearInterval(reconnectInterval);
  }, [ws]);

  // Function to send location updates (for drivers)
  const updateLocation = useCallback(async (latitude: number, longitude: number, speed?: number, heading?: number) => {
    if (!ws || !bookingId) return;

    try {
      ws.send(JSON.stringify({
        type: 'location_update',
        bookingId,
        latitude,
        longitude,
        speed,
        heading
      }));
    } catch (err) {
      console.error('Failed to send location update:', err);
      setError('Failed to send location update');
    }
  }, [ws, bookingId]);

  return {
    location,
    error,
    updateLocation
  };
}
