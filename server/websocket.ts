import { WebSocket, WebSocketServer } from "ws";
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
  ws: WebSocket;
  bookingId?: number;
  userId: number;
  role: string;
}

const clients = new Map<WebSocket, TrackingClient>();

export function setupWebSocket(wss: WebSocket.Server) {
  wss.on("connection", (ws: WebSocket) => {
    console.log("New WebSocket connection");

    ws.on("message", async (message: string) => {
      try {
        const data = JSON.parse(message);

        if (!data.type) {
          throw new Error("Message type is required");
        }

        switch (data.type) {
          case "init":
            if (!data.userId || !data.role) {
              throw new Error("userId and role are required for initialization");
            }
            clients.set(ws, { ws, userId: data.userId, role: data.role });
            break;

          case "subscribe_tracking":
            if (!data.bookingId) {
              throw new Error("bookingId is required for tracking subscription");
            }
            const client = clients.get(ws);
            if (client) {
              client.bookingId = data.bookingId;
            }
            break;

          case "location_update":
            const locationData = data as LocationUpdate;
            if (!locationData.bookingId || !locationData.latitude || !locationData.longitude) {
              throw new Error("Invalid location update data");
            }

            // Store location update in database
            await db.insert(locationTracking).values({
              bookingId: locationData.bookingId,
              latitude: locationData.latitude.toString(),
              longitude: locationData.longitude.toString(),
              speed: locationData.speed?.toString(),
              heading: locationData.heading?.toString(),
              status: 'active'
            });

            // Update booking's last known location
            await db.update(bookings)
              .set({
                lastKnownLatitude: locationData.latitude.toString(),
                lastKnownLongitude: locationData.longitude.toString(),
                lastLocationUpdate: new Date(),
              })
              .where(eq(bookings.id, locationData.bookingId));

            // Broadcast to relevant clients
            broadcastLocationUpdate(locationData);
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
    });
  });
}

function broadcastLocationUpdate(update: LocationUpdate) {
  for (const [_, client] of clients) {
    if (client.bookingId === update.bookingId) {
      try {
        client.ws.send(JSON.stringify({
          type: "location_update",
          data: update
        }));
      } catch (error) {
        console.error("WebSocket send error:", error);
      }
    }
  }
}
