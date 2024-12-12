import { Express } from "express";
import { db } from "./db";
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

function setupBookingRoutes(app: Express) {
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
    } catch (error: any) {
      console.error("Error fetching user bookings:", error);
      res.status(500).send("Error fetching bookings");
    }
  });

  // Admin: Get all bookings with user details
  app.get("/api/admin/bookings", async (req, res) => {
    console.log("Admin bookings request received", {
      isAuthenticated: req.isAuthenticated(),
      userRole: req.user?.role
    });

    if (!req.isAuthenticated() || req.user?.role !== 'admin') {
      return res.status(403).send("Unauthorized - Admin access required");
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
          serviceType: bookings.serviceType,
          specialRequests: bookings.specialRequests,
          chauffeurId: bookings.chauffeurId,
          createdAt: bookings.createdAt,
          passengerName: users.fullName
        })
        .from(bookings)
        .leftJoin(users, eq(bookings.userId, users.id))
        .orderBy(desc(bookings.createdAt));

      console.log("Found bookings:", allBookings);

      // Fetch driver details for bookings with chauffeurs
      const bookingsWithDetails = await Promise.all(
        allBookings.map(async (booking) => {
          let driverName = undefined;

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

              driverName = driver[0]?.fullName;
            }
          }

          return {
            ...booking,
            driverName
          };
        })
      );

      console.log("Sending bookings with details:", bookingsWithDetails);
      res.json(bookingsWithDetails);
    } catch (error: any) {
      console.error("Error fetching all bookings:", error);
      res.status(500).send(`Error fetching bookings: ${error.message}`);
    }
  });

  // Create a new booking (admin)
  app.post("/api/admin/bookings", async (req, res) => {
    console.log("Received admin booking creation request:", req.body);
    
    if (!req.isAuthenticated() || req.user?.role !== 'admin') {
      return res.status(403).send("Unauthorized");
    }

    try {
      // Combine date and time into a single Date object
      const pickupDateTime = new Date(req.body.pickupDate + ' ' + req.body.pickupTime);
      
      const bookingData = {
        userId: parseInt(req.body.userId),
        pickupLocation: req.body.pickupLocation,
        dropoffLocation: req.body.dropoffLocation,
        serviceType: req.body.serviceType,
        pickupDate: pickupDateTime,
        passengerCount: parseInt(req.body.passengerCount),
        totalFare: parseFloat(req.body.totalFare),
        specialRequests: req.body.specialRequests || null,
        status: 'pending',
        paymentStatus: 'pending',
        basePrice: req.body.totalFare, // Using totalFare as basePrice for now
        categoryId: 1, // Default category
        trackingEnabled: false,
        stops: [],
      };

      console.log('Attempting to create booking with data:', bookingData);

      const newBooking = await db.insert(bookings)
        .values(bookingData)
        .returning();

      // Fetch additional details for the response
      const bookingWithDetails = await db
        .select({
          id: bookings.id,
          userId: bookings.userId,
          pickupLocation: bookings.pickupLocation,
          dropoffLocation: bookings.dropoffLocation,
          pickupDate: bookings.pickupDate,
          status: bookings.status,
          totalFare: bookings.totalFare,
          passengerCount: bookings.passengerCount,
          serviceType: bookings.serviceType,
          specialRequests: bookings.specialRequests,
          chauffeurId: bookings.chauffeurId,
          createdAt: bookings.createdAt,
          passengerName: users.fullName
        })
        .from(bookings)
        .leftJoin(users, eq(bookings.userId, users.id))
        .where(eq(bookings.id, newBooking[0].id))
        .limit(1);

      console.log('Created new booking with details:', bookingWithDetails[0]);
      res.json(bookingWithDetails[0]);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      res.status(500).send(`Error creating booking: ${error.message}`);
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
    } catch (error: any) {
      console.error("Error updating booking status:", error);
      res.status(500).send("Error updating booking status");
    }
  });
}

export function registerRoutes(app: Express) {
  setupAuth(app);
  setupBookingRoutes(app);
}
