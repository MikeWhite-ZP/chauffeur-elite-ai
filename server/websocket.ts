import { WebSocket as WS, WebSocketServer } from "ws";
import { db } from "../db";
import { locationTracking, bookings } from "@db/schema";
import { eq } from "drizzle-orm";

interface LocationUpdate {
  type: "location_update";
  bookingId: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
}

interface TrackingClient {
  ws: WS;
  bookingId?: number;
  userId: number;
  role: string;
}

const clients = new Map<WS, TrackingClient>();

export function setupWebSocket(wss: WebSocketServer) {
  function handleClose(ws: WS) {
    clients.delete(ws);
    console.log("Client disconnected");
  }

  function handleError(ws: WS, error: Error) {
    console.error("WebSocket error:", error);
    try {
      ws.send(JSON.stringify({ type: "error", message: "Internal server error" }));
    } catch (e) {
      console.error("Failed to send error message:", e);
    }
  }

  async function handleMessage(ws: WS, message: Buffer) {
    let data;
    try {
      data = JSON.parse(message.toString('utf-8'));
    } catch (e) {
      handleError(ws, new Error("Invalid JSON message"));
      return;
    }

    if (!data.type) {
      handleError(ws, new Error("Message type is required"));
      return;
    }

    try {
      switch (data.type) {
        case "init":
          if (!data.userId || !data.role) {
            throw new Error("userId and role are required for initialization");
          }
          clients.set(ws, { ws, userId: data.userId, role: data.role });
          ws.send(JSON.stringify({ type: 'init_success' }));
          break;

        case "subscribe_tracking":
          if (!data.bookingId) {
            throw new Error("bookingId is required for tracking subscription");
          }
          const client = clients.get(ws);
          if (client) {
            client.bookingId = data.bookingId;
            ws.send(JSON.stringify({ type: 'subscribe_success', bookingId: data.bookingId }));
          }
          break;

        case "location_update":
          const locationData = data as LocationUpdate;
          if (!locationData.bookingId || !locationData.latitude || !locationData.longitude) {
            throw new Error("Invalid location update data");
          }

          await db.insert(locationTracking).values({
            bookingId: locationData.bookingId,
            latitude: locationData.latitude.toString(),
            longitude: locationData.longitude.toString(),
            speed: locationData.speed?.toString(),
            heading: locationData.heading?.toString(),
            status: 'active'
          });

          await db.update(bookings)
            .set({
              lastKnownLatitude: locationData.latitude.toString(),
              lastKnownLongitude: locationData.longitude.toString(),
              lastLocationUpdate: new Date(),
            })
            .where(eq(bookings.id, locationData.bookingId));

          broadcastLocationUpdate(locationData);
          break;

        default:
          throw new Error(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      handleError(ws, error as Error);
    }
  }

  wss.on("connection", (ws: WS) => {
    console.log("New WebSocket connection established");
    
    try {
      ws.send(JSON.stringify({ type: 'connection_established' }));
    } catch (e) {
      console.error("Failed to send connection acknowledgment:", e);
    }

    ws.on("message", (message) => handleMessage(ws, message as Buffer));
    ws.on("error", (error) => handleError(ws, error));
    ws.on("close", () => handleClose(ws));
  });

  setInterval(() => {
    wss.clients.forEach((ws: WS) => {
      try {
        ws.ping();
      } catch (e) {
        console.error("Ping failed:", e);
      }
    });
  }, 30000); // Send ping every 30 seconds
}

function broadcastLocationUpdate(update: LocationUpdate) {
  const message = JSON.stringify({
    type: "location_update",
    data: update
  });

  clients.forEach((client, ws) => {
    if (client.bookingId === update.bookingId && ws.readyState === WS.OPEN) {
      try {
        ws.send(message);
      } catch (error) {
        console.error("Failed to broadcast location update:", error);
      }
    }
  });
}

// Function removed as it's a duplicate
