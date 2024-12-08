import { Express } from "express";
import { db } from "../db";
import { bookings } from "@db/schema";
import { eq } from "drizzle-orm";
import { setupAuth } from "./auth";

export function registerRoutes(app: Express) {
  // Set up authentication routes
  setupAuth(app);

  // Get user's bookings
  app.get("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const userBookings = await db
        .select()
        .from(bookings)
        .where(eq(bookings.userId, req.user!.id))
        .orderBy(bookings.date);

      res.json(userBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).send("Error fetching bookings");
    }
  });

  // Create new booking
  app.post("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const [booking] = await db
        .insert(bookings)
        .values({
          userId: req.user!.id,
          pickupLocation: req.body.pickupLocation,
          dropoffLocation: req.body.dropoffLocation,
          serviceClass: req.body.serviceClass,
          date: new Date(req.body.date),
          fare: req.body.fare,
        })
        .returning();

      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).send("Error creating booking");
    }
  });

  // Sync offline bookings
  app.post("/api/bookings/sync", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const pendingBookings = req.body;
      const syncedBookings = await Promise.all(
        pendingBookings.map(async (booking: any) => {
          const [newBooking] = await db
            .insert(bookings)
            .values({
              ...booking,
              userId: req.user!.id,
            })
            .returning();
          return newBooking;
        })
      );

      res.json(syncedBookings);
    } catch (error) {
      console.error("Error syncing bookings:", error);
      res.status(500).send("Error syncing bookings");
    }
  });
}
