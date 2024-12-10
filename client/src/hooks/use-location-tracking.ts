import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from './use-user';

interface LocationUpdate {
  bookingId: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
}

interface WebSocketMessage {
  type: string;
  data?: LocationUpdate;
  bookingId?: number;
  message?: string;
}

export function useLocationTracking(bookingId?: number) {
  const [location, setLocation] = useState<LocationUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useUser();
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const MAX_RECONNECT_ATTEMPTS = 5;
  const INITIAL_RECONNECT_DELAY = 1000;
  const PING_INTERVAL = 30000;

  const cleanupWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setIsConnected(false);
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connection established');
        setError(null);
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Initialize connection
        if (user) {
          ws.send(JSON.stringify({
            type: 'init',
            userId: user.id,
            role: user.role
          }));
        }

        // Subscribe to tracking if bookingId is available
        if (bookingId) {
          ws.send(JSON.stringify({
            type: 'subscribe_tracking',
            bookingId
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          switch (message.type) {
            case 'location_update':
              if (message.data) {
                setLocation(message.data);
              }
              break;
            case 'error':
              setError(message.message || 'Unknown error occurred');
              break;
            case 'init_success':
            case 'subscribe_success':
              console.log(`${message.type} received`);
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error occurred');
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        const shouldReconnect = reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS;
        
        if (shouldReconnect) {
          const delay = INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current);
          console.log(`Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connectWebSocket();
          }, delay);
        } else {
          setError('Connection lost. Please refresh the page to reconnect.');
        }
      };

      // Setup ping interval
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, PING_INTERVAL);

      return () => {
        clearInterval(pingInterval);
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      setError('Failed to establish connection');
      setIsConnected(false);
    }
  }, [user, bookingId]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;
    connectWebSocket();
    return () => cleanupWebSocket();
  }, [user, bookingId, connectWebSocket, cleanupWebSocket]);

  // Location update function for drivers
  const updateLocation = useCallback((latitude: number, longitude: number, speed?: number, heading?: number) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !bookingId) return;

    try {
      wsRef.current.send(JSON.stringify({
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
  }, [bookingId]);

  return {
    location,
    error,
    isConnected,
    updateLocation
  };
}
