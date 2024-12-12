import { Express } from "express";
import { db } from "./db";
import { bookings, users, chauffeurs } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { setupAuth } from "./auth";
import { z } from "zod";
import { nanoid } from 'nanoid';

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
          tripId: bookings.tripId,
          userId: bookings.userId,
          accountId: bookings.accountId,
          billingContact: bookings.billingContact,
          companyName: bookings.companyName,
          passengerFirstName: bookings.passengerFirstName,
          passengerLastName: bookings.passengerLastName,
          passengerPhone: bookings.passengerPhone,
          passengerEmail: bookings.passengerEmail,
          poClientRef: bookings.poClientRef,
          pickupDate: bookings.pickupDate,
          pickupTime: bookings.pickupTime,
          pickupLocation: bookings.pickupLocation,
          dropoffLocation: bookings.dropoffLocation,
          airportCode: bookings.airportCode,
          airportName: bookings.airportName,
          airlineCode: bookings.airlineCode,
          airlineName: bookings.airlineName,
          flightNumber: bookings.flightNumber,
          tripNotes: bookings.tripNotes,
          jobStatus: bookings.jobStatus,
          additionalRequests: bookings.additionalRequests,
          serviceType: bookings.serviceType,
          vehicleType: bookings.vehicleType,
          chauffeurId: bookings.chauffeurId,
          vehicleId: bookings.vehicleId,
          basePrice: bookings.basePrice,
          gratuityFee: bookings.gratuityFee,
          extraStopsFee: bookings.extraStopsFee,
          discount: bookings.discount,
          tolls: bookings.tolls,
          parking: bookings.parking,
          creditCardFee: bookings.creditCardFee,
          grandTotal: bookings.grandTotal,
          paymentsDeposits: bookings.paymentsDeposits,
          totalDue: bookings.totalDue,
          trackingEnabled: bookings.trackingEnabled,
          lastKnownLatitude: bookings.lastKnownLatitude,
          lastKnownLongitude: bookings.lastKnownLongitude,
          lastLocationUpdate: bookings.lastLocationUpdate,
          estimatedArrivalTime: bookings.estimatedArrivalTime,
          createdAt: bookings.createdAt
        })
        .from(bookings)
        .orderBy(desc(bookings.createdAt));

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
      // First check if user exists
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(req.body.userId)))
        .limit(1);

      if (!user || user.length === 0) {
        return res.status(400).json({
          error: `User with ID ${req.body.userId} does not exist`
        });
      }

      // Calculate total price
      const basePrice = parseFloat(req.body.basePrice);
      const gratuityFee = parseFloat(req.body.gratuityFee || '0');
      const extraStopsFee = parseFloat(req.body.extraStopsFee || '0');
      const discount = parseFloat(req.body.discount || '0');
      const tolls = parseFloat(req.body.tolls || '0');
      const parking = parseFloat(req.body.parking || '0');
      const creditCardFee = parseFloat(req.body.creditCardFee || '0');
      const paymentsDeposits = parseFloat(req.body.paymentsDeposits || '0');

      const grandTotal = basePrice + gratuityFee + extraStopsFee + tolls + parking + creditCardFee - discount;
      const totalDue = grandTotal - paymentsDeposits;
      
      const bookingData = {
        tripId: nanoid(10),
        userId: parseInt(req.body.userId),
        accountId: req.body.accountId,
        billingContact: req.body.billingContact,
        companyName: req.body.companyName,
        passengerFirstName: req.body.passengerFirstName,
        passengerLastName: req.body.passengerLastName,
        passengerPhone: req.body.passengerPhone,
        passengerEmail: req.body.passengerEmail,
        poClientRef: req.body.poClientRef,
        pickupDate: new Date(req.body.pickupDate),
        pickupTime: req.body.pickupTime,
        pickupLocation: req.body.pickupLocation,
        dropoffLocation: req.body.dropoffLocation,
        airportCode: req.body.airportCode,
        airportName: req.body.airportName,
        airlineCode: req.body.airlineCode,
        airlineName: req.body.airlineName,
        flightNumber: req.body.flightNumber,
        tripNotes: req.body.tripNotes,
        jobStatus: 'unassigned',
        additionalRequests: req.body.additionalRequests || [],
        serviceType: req.body.serviceType,
        vehicleType: req.body.vehicleType,
        basePrice: basePrice.toString(),
        gratuityFee: gratuityFee.toString(),
        extraStopsFee: extraStopsFee.toString(),
        discount: discount.toString(),
        tolls: tolls.toString(),
        parking: parking.toString(),
        creditCardFee: creditCardFee.toString(),
        grandTotal: grandTotal.toString(),
        paymentsDeposits: paymentsDeposits.toString(),
        totalDue: totalDue.toString(),
        trackingEnabled: false
      };
      
      console.log('Attempting to create booking with data:', bookingData);

      const [newBooking] = await db.insert(bookings)
        .values([bookingData])
        .returning();

      console.log('Created new booking:', newBooking);
      res.json(newBooking);
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
    const { jobStatus } = req.body;

    try {
      await db
        .update(bookings)
        .set({ jobStatus })
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
