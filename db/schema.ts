import { pgTable, text, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").unique().notNull(),
  phoneNumber: text("phone_number").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  type: text("type").notNull(), // sedan, suv, van
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: text("year").notNull(),
  licensePlate: text("license_plate").unique().notNull(),
  capacity: integer("capacity").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chauffeurs = pgTable("chauffeurs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  licenseNumber: text("license_number").unique().notNull(),
  experienceYears: integer("experience_years").notNull(),
  rating: decimal("rating"),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  chauffeurId: integer("chauffeur_id").references(() => chauffeurs.id),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  stops: text("stops").array(),
  serviceType: text("service_type").notNull(), // hourly, destination
  vehicleType: text("vehicle_type").notNull(), // sedan, suv, van
  pickupDate: timestamp("pickup_date").notNull(),
  duration: integer("duration"), // in hours, for hourly bookings
  specialRequests: text("special_requests"),
  passengerCount: integer("passenger_count").notNull(),
  fare: decimal("fare").notNull(),
  status: text("status").default("pending"),
  paymentStatus: text("payment_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  bookingId: integer("booking_id").references(() => bookings.id),
  userId: integer("user_id").references(() => users.id),
  chauffeurId: integer("chauffeur_id").references(() => chauffeurs.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Export schemas and types
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;

export const insertVehicleSchema = createInsertSchema(vehicles);
export const selectVehicleSchema = createSelectSchema(vehicles);
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = z.infer<typeof selectVehicleSchema>;

export const insertChauffeurSchema = createInsertSchema(chauffeurs);
export const selectChauffeurSchema = createSelectSchema(chauffeurs);
export type InsertChauffeur = z.infer<typeof insertChauffeurSchema>;
export type Chauffeur = z.infer<typeof selectChauffeurSchema>;

export const insertBookingSchema = createInsertSchema(bookings);
export const selectBookingSchema = createSelectSchema(bookings);
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = z.infer<typeof selectBookingSchema>;

export const insertReviewSchema = createInsertSchema(reviews);
export const selectReviewSchema = createSelectSchema(reviews);
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = z.infer<typeof selectReviewSchema>;
