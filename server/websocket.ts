import { WebSocket as WS, WebSocketServer, RawData } from "ws";
import { db } from "../db";
import { locationTracking, bookings, type User } from "@db/schema";
import { eq } from "drizzle-orm";
import { Server } from "http";

// Store admin WebSocket connections
export const adminConnections = new Set<WS>();

export function addAdminConnection(ws: WS) {
  adminConnections.add(ws);
  ws.on('close', () => {
    adminConnections.delete(ws);
  });
}

// Custom type for WebSocket server errors
interface WebSocketError extends Error {
  code?: string;
  message: string;
}

// Message type definitions
type MessageType = 'init' | 'subscribe_tracking' | 'location_update' | 'ping' | 'pong' | 'error' | 'connection_established' | 'init_success' | 'subscribe_success' | 'location_update_ack';

interface BaseMessage {
  type: MessageType;
}

interface LocationUpdate extends BaseMessage {
  type: 'location_update';
  bookingId: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  timestamp?: string;
}

interface InitMessage extends BaseMessage {
  type: 'init';
  userId: number;
  role: string;
}

interface SubscribeMessage extends BaseMessage {
  type: 'subscribe_tracking';
  bookingId: number;
}

interface PingMessage extends BaseMessage {
  type: 'ping';
}

interface ErrorMessage extends BaseMessage {
  type: 'error';
  message: string;
}

interface TrackingClient {
  ws: WS;
  bookingId?: number;
  userId: number;
  role: string;
  lastPing?: number;
}

interface LocationUpdateAck extends BaseMessage {
  type: 'location_update_ack';
  bookingId: number;
  timestamp: string;
}

interface ConnectionEstablished extends BaseMessage {
  type: 'connection_established';
  timestamp: string;
}

type IncomingMessage = LocationUpdate | InitMessage | SubscribeMessage | PingMessage;
type OutgoingMessage = LocationUpdate | ErrorMessage | BaseMessage | LocationUpdateAck | ConnectionEstablished;

const clients = new Map<WS, TrackingClient>();

export function setupWebSocket(wss: WebSocketServer) {
  function handleClose(ws: WS) {
    const client = clients.get(ws);
    if (client) {
      console.log(`Client ${client.userId} disconnected`);
      // Mark the client's last tracking record as inactive if it exists
      if (client.bookingId) {
        db.update(locationTracking)
          .set({ status: 'inactive' })
          .where(eq(locationTracking.bookingId, client.bookingId))
          .catch(err => console.error('Error updating location tracking status:', err));
      }
    }
    clients.delete(ws);
  }

  function handleError(ws: WS, error: Error) {
    console.error("WebSocket error:", error);
    const client = clients.get(ws);
    if (client) {
      console.error(`Error for client ${client.userId}:`, error);
    }
    
    if (ws.readyState === WS.OPEN) {
      try {
        ws.send(JSON.stringify({ 
          type: "error", 
          message: error.message || "Internal server error",
          timestamp: new Date().toISOString()
        }));
      } catch (e) {
        console.error("Failed to send error message:", e);
      }
    }
  }

  async function handleMessage(ws: WS, message: RawData) {
    let data: IncomingMessage;
    
    try {
      data = JSON.parse(message.toString('utf-8')) as IncomingMessage;
      
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid message format");
      }

      console.log('WebSocket message received:', {
        type: data.type,
        hasClient: clients.has(ws),
        timestamp: new Date().toISOString()
      });

    } catch (e) {
      handleError(ws, new Error("Invalid JSON message"));
      return;
    }

    if (!data.type) {
      handleError(ws, new Error("Message type is required"));
      return;
    }

    const client = clients.get(ws);
    if (!client && data.type !== 'init') {
      handleError(ws, new Error("Client not initialized"));
      return;
    }

    // Update client's last activity timestamp
    if (client) {
      client.lastPing = Date.now();
    }

    try {
      switch (data.type) {
        case "init": {
          const initData = data as InitMessage;
          if (!initData.userId || !initData.role) {
            throw new Error("userId and role are required for initialization");
          }
          clients.set(ws, { 
            ws, 
            userId: initData.userId, 
            role: initData.role,
            lastPing: Date.now()
          });
          ws.send(JSON.stringify({ type: 'init_success' }));
          break;
        }

        case "subscribe_tracking": {
          const subData = data as SubscribeMessage;
          if (!subData.bookingId) {
            throw new Error("bookingId is required for tracking subscription");
          }
          if (client) {
            client.bookingId = subData.bookingId;
            client.lastPing = Date.now();
            ws.send(JSON.stringify({ type: 'subscribe_success', bookingId: subData.bookingId }));
          }
          break;
        }

        case "location_update": {
          const locationData = data as LocationUpdate;
          if (!locationData.bookingId || !locationData.latitude || !locationData.longitude) {
            throw new Error("Invalid location update data");
          }

          if (client) {
            client.lastPing = Date.now();
          }

          // Record the location update with timestamps and validation
          const timestamp = new Date();
          const locationRecord = [{
            bookingId: locationData.bookingId,
            latitude: locationData.latitude.toString(),
            longitude: locationData.longitude.toString(),
            speed: locationData.speed?.toString() ?? null,
            heading: locationData.heading?.toString() ?? null,
            status: 'active' as const,
            timestamp
          }];

          console.log('Processing location update:', {
            bookingId: locationData.bookingId,
            timestamp: timestamp.toISOString(),
            coordinates: `${locationData.latitude},${locationData.longitude}`
          });

          try {
            // Insert location record
            await db.insert(locationTracking).values(locationRecord);

            // Update booking with latest location
            await db.update(bookings)
              .set({
                lastKnownLatitude: locationData.latitude.toString(),
                lastKnownLongitude: locationData.longitude.toString(),
                lastLocationUpdate: timestamp,
                trackingEnabled: true
              })
              .where(eq(bookings.id, locationData.bookingId));

            // Broadcast to all subscribed clients
            broadcastLocationUpdate({
              ...locationData,
              timestamp: timestamp.toISOString()
            });

            // Send acknowledgment to the sender
            ws.send(JSON.stringify({
              type: 'location_update_ack',
              bookingId: locationData.bookingId,
              timestamp: timestamp.toISOString()
            }));
          } catch (error) {
            console.error('Failed to process location update:', error);
            handleError(ws, new Error('Failed to process location update'));
          }
          break;
        }

        case "ping": {
          if (client) {
            client.lastPing = Date.now();
            ws.send(JSON.stringify({ type: 'pong' }));
          }
          break;
        }

        default:
          throw new Error(`Unknown message type: ${(data as any).type}`);
      }
    } catch (error) {
      handleError(ws, error instanceof Error ? error : new Error(String(error)));
    }
  }

  wss.on("connection", (ws: WS) => {
    console.log("New WebSocket connection established");
    
    // Clean up any existing connection for this WebSocket
    if (clients.has(ws)) {
      handleClose(ws);
    }

    // Set up error handling for the new connection
    ws.on('error', (error: Error) => {
      console.error('WebSocket connection error:', error);
      handleError(ws, error);
    });
    
    if (ws.readyState === WS.OPEN) {
      try {
        ws.send(JSON.stringify({ 
          type: 'connection_established',
          timestamp: new Date().toISOString()
        }));
      } catch (e) {
        console.error("Failed to send connection acknowledgment:", e);
        handleClose(ws);
        return;
      }
    }

    ws.on("message", (message) => handleMessage(ws, message as Buffer));
    ws.on("error", (error) => handleError(ws, error));
    ws.on("close", () => handleClose(ws));
    
    // Set an initial ping timeout
    const client = clients.get(ws);
    if (client) {
      client.lastPing = Date.now();
    }
  });

  // Ping all clients every 30 seconds to keep connections alive
  const PING_INTERVAL = 30000;
  const PING_TIMEOUT = 70000; // Consider connection dead if no ping for 70 seconds

  setInterval(() => {
    const now = Date.now();
    const clientsArray = Array.from(clients.entries());
    
    for (const [ws, client] of clientsArray) {
      // Check if client hasn't responded to ping for too long
      if (client.lastPing && now - client.lastPing > PING_TIMEOUT) {
        console.log(`Client ${client.userId} timed out, closing connection`);
        ws.close();
        clients.delete(ws);
        continue;
      }

      // Send ping to active connections
      if (ws.readyState === WS.OPEN) {
        try {
          ws.ping();
        } catch (e) {
          console.error("Ping failed:", e);
          clients.delete(ws);
        }
      }
    }
  }, PING_INTERVAL);
}

function broadcastLocationUpdate(update: LocationUpdate) {
  const message = JSON.stringify({
    type: "location_update",
    data: update
  });

  const clientsArray = Array.from(clients.entries());
  for (const [ws, client] of clientsArray) {
    if (client.bookingId === update.bookingId && ws.readyState === WS.OPEN) {
      try {
        ws.send(message);
      } catch (error) {
        console.error("Failed to broadcast location update:", error);
        clients.delete(ws);
      }
    }
  }
}

// Helper function to clean up stale connections
function cleanupStaleConnections() {
  const now = Date.now();
  const STALE_TIMEOUT = 120000; // 2 minutes

  const clientsArray = Array.from(clients.entries());
  for (const [ws, client] of clientsArray) {
    if (
      ws.readyState === WS.CLOSED || 
      ws.readyState === WS.CLOSING ||
      (client.lastPing && now - client.lastPing > STALE_TIMEOUT)
    ) {
      clients.delete(ws);
      console.log("Cleaned up stale connection for user:", client.userId);
    }
  }
}

// Run cleanup every minute
setInterval(cleanupStaleConnections, 60000);
