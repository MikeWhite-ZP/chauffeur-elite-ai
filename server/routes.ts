import { Express } from "express";
import { db } from "../db";
import { bookings, users, chauffeurs } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { setupAuth } from "./auth";

export function registerRoutes(app: Express) {
  setupAuth(app);

  // Get user's bookings
  app.get("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(403).send("Unauthorized");
    }

    try {
      const userBookings = await db
        .select()
        .from(bookings)
        .where(eq(bookings.userId, req.user!.id))
        .orderBy(desc(bookings.pickupDate));

      res.json(userBookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).send("Error fetching bookings");
    }
  });

  // Admin: Get all bookings with user details
  app.get("/api/admin/bookings", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== 'admin') {
      return res.status(403).send("Unauthorized");
    }

    try {
      const allBookings = await db
        .select({
          id: bookings.id,
          userId: bookings.userId,
          pickupLocation: bookings.pickupLocation,
          dropoffLocation: bookings.dropoffLocation,
          pickupDate: bookings.pickupDate,
          status: bookings.status,
          totalFare: bookings.totalFare,
          passengerCount: bookings.passengerCount,
          chauffeurId: bookings.chauffeurId,
          vehicleId: bookings.vehicleId,
          trackingEnabled: bookings.trackingEnabled,
          lastKnownLatitude: bookings.lastKnownLatitude,
          lastKnownLongitude: bookings.lastKnownLongitude,
          lastLocationUpdate: bookings.lastLocationUpdate,
        })
        .from(bookings)
        .orderBy(desc(bookings.pickupDate));

      res.json(allBookings);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      res.status(500).send("Error fetching bookings");
    }
  });

  // Update booking status
  app.post("/api/admin/bookings/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== 'admin') {
      return res.status(403).send("Unauthorized");
    }

    const bookingId = parseInt(req.params.id);
    const { status } = req.body;

    try {
      await db
        .update(bookings)
        .set({ status })
        .where(eq(bookings.id, bookingId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).send("Error updating booking status");
    }
  });

  // Get active bookings for tracking
  app.get("/api/admin/active-bookings", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== 'admin') {
      return res.status(403).send("Unauthorized");
    }

    try {
      const activeBookings = await db
        .select({
          id: bookings.id,
          driverId: chauffeurs.id,
          passengerId: bookings.userId,
          status: bookings.status,
          pickupLocation: bookings.pickupLocation,
          dropoffLocation: bookings.dropoffLocation,
          lastKnownLatitude: bookings.lastKnownLatitude,
          lastKnownLongitude: bookings.lastKnownLongitude,
          driverName: users.fullName,
          passengerName: users.fullName,
        })
        .from(bookings)
        .innerJoin(chauffeurs, eq(bookings.chauffeurId, chauffeurs.id))
        .innerJoin(users, eq(chauffeurs.userId, users.id))
        .where(eq(bookings.status, 'in_progress'));

      res.json(activeBookings);
    } catch (error) {
      console.error("Error fetching active bookings:", error);
      res.status(500).send("Error fetching active bookings");
    }
  });
}
