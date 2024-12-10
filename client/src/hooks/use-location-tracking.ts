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

type WSStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export function useLocationTracking(bookingId?: number) {
  const [location, setLocation] = useState<LocationUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<WSStatus>('disconnected');
  const { user } = useUser();
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const pingIntervalRef = useRef<NodeJS.Timeout>();
  const initCheckIntervalRef = useRef<NodeJS.Timeout>();

  const MAX_RECONNECT_ATTEMPTS = 5;
  const INITIAL_RECONNECT_DELAY = 1000;
  const PING_INTERVAL = 30000;
  const CONNECTION_TIMEOUT = 5000;

  const isConnected = connectionStatus === 'connected';

  const cleanupWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    if (initCheckIntervalRef.current) {
      clearInterval(initCheckIntervalRef.current);
    }
    setConnectionStatus('disconnected');
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      setConnectionStatus('connecting');
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      let initSent = false;
      let subscribeSent = false;

      // Connection timeout handler
      const connectionTimeout = setTimeout(() => {
        if (connectionStatus === 'connecting') {
          setError('Connection timeout. Please try again.');
          setConnectionStatus('error');
          cleanupWebSocket();
        }
      }, CONNECTION_TIMEOUT);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket connection established');
        setError(null);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;

        // Function to handle initialization and subscription
        const initializeConnection = () => {
          if (!initSent && user && ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({
                type: 'init',
                userId: user.id,
                role: user.role
              }));
              initSent = true;
            } catch (e) {
              console.error('Failed to send init message:', e);
            }
          }

          if (!subscribeSent && bookingId && initSent && ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({
                type: 'subscribe_tracking',
                bookingId
              }));
              subscribeSent = true;
            } catch (e) {
              console.error('Failed to send subscribe message:', e);
            }
          }
        };

        // Try initialization immediately and retry if needed
        initializeConnection();
        initCheckIntervalRef.current = setInterval(() => {
          if (!initSent || !subscribeSent) {
            initializeConnection();
          } else {
            if (initCheckIntervalRef.current) {
              clearInterval(initCheckIntervalRef.current);
            }
          }
        }, 1000);

        // Setup ping interval
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({ type: 'ping' }));
            } catch (e) {
              console.error('Failed to send ping:', e);
            }
          }
        }, PING_INTERVAL);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          switch (message.type) {
            case 'location_update':
              if (message.data) {
                setLocation(message.data);
                setError(null);
              }
              break;
            case 'error':
              setError(message.message || 'Unknown error occurred');
              setConnectionStatus('error');
              break;
            case 'init_success':
            case 'subscribe_success':
              console.log(`${message.type} received`);
              setError(null);
              break;
            case 'pong':
              // Connection is alive
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
          setError('Invalid message received');
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error occurred');
        setConnectionStatus('error');
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
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

      return () => {
        clearTimeout(connectionTimeout);
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      setError('Failed to establish connection');
      setConnectionStatus('error');
    }
  }, [user, bookingId, connectionStatus, cleanupWebSocket]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;
    
    // Clear any existing connection first
    cleanupWebSocket();
    
    // Start new connection
    connectWebSocket();

    // Cleanup function
    return () => {
      cleanupWebSocket();
    };
  }, [user, bookingId, connectWebSocket, cleanupWebSocket]);

  // Location update function for drivers
  const updateLocation = useCallback((latitude: number, longitude: number, speed?: number, heading?: number) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !bookingId) {
      console.warn('Cannot update location: WebSocket not ready or no booking ID');
      return;
    }

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
      setConnectionStatus('error');
    }
  }, [bookingId]);

  return {
    location,
    error,
    isConnected,
    updateLocation,
    connectionStatus
  };
}
