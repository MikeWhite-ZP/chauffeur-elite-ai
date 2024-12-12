import { Express } from "express";
import { db } from "../db";
import { bookings, users, chauffeurs } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { setupAuth } from "./auth";
import { z } from "zod";

// Extend Express.User to include role
declare global {
  namespace Express {
    interface User {
      id: number;
      role: 'admin' | 'driver' | 'passenger';
    }
  }
}

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
          passengerName: users.fullName
        })
        .from(bookings)
        .leftJoin(users, eq(bookings.userId, users.id))
        .orderBy(desc(bookings.pickupDate));

      // Fetch driver details for bookings with chauffeurs
      const bookingsWithDetails = await Promise.all(
        allBookings.map(async (booking) => {
          let driverName = 'Not Assigned';
          
          if (booking.chauffeurId) {
            const chauffeur = await db
              .select({
                userId: chauffeurs.userId
              })
              .from(chauffeurs)
              .where(eq(chauffeurs.id, booking.chauffeurId))
              .limit(1);

            if (chauffeur[0]?.userId) {
              const driver = await db
                .select({
                  fullName: users.fullName
                })
                .from(users)
                .where(eq(users.id, chauffeur[0].userId))
                .limit(1);
              
              driverName = driver[0]?.fullName || 'Unknown Driver';
            }
          }

          return {
            ...booking,
            driverName,
            passengerName: booking.passengerName || 'Unknown Passenger'
          };
        })
      );

      res.json(bookingsWithDetails);
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
          pickupLocation: bookings.pickupLocation,
          dropoffLocation: bookings.dropoffLocation,
          status: bookings.status,
          lastKnownLatitude: bookings.lastKnownLatitude,
          lastKnownLongitude: bookings.lastKnownLongitude,
          userId: bookings.userId,
          chauffeurId: bookings.chauffeurId
        })
        .from(bookings)
        .where(eq(bookings.status, 'in_progress'));

      // Add driver and passenger names
      const bookingsWithNames = await Promise.all(
        activeBookings.map(async (booking) => {
          let driverName = 'Not Assigned';
          let passengerName = 'Unknown';

          // Get passenger name
          if (booking.userId) {
            const passenger = await db
              .select({
                fullName: users.fullName
              })
              .from(users)
              .where(eq(users.id, booking.userId))
              .limit(1);
            
            passengerName = passenger[0]?.fullName || 'Unknown Passenger';
          }

          // Get driver name if chauffeur is assigned
          if (booking.chauffeurId) {
            const chauffeur = await db
              .select({
                userId: chauffeurs.userId
              })
              .from(chauffeurs)
              .where(eq(chauffeurs.id, booking.chauffeurId))
              .limit(1);

            if (chauffeur[0]?.userId) {
              const driver = await db
                .select({
                  fullName: users.fullName
                })
                .from(users)
                .where(eq(users.id, chauffeur[0].userId))
                .limit(1);
              
              driverName = driver[0]?.fullName || 'Unknown Driver';
            }
          }

          return {
            ...booking,
            driverName,
            passengerName
          };
        })
      );

      res.json(bookingsWithNames);
    } catch (error) {
      console.error("Error fetching active bookings:", error);
      res.status(500).send("Error fetching active bookings");
    }
  });
}
