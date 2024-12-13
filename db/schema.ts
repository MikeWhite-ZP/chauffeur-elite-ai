import { pgTable, text, integer, timestamp, decimal, boolean, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export type UserRole = 'admin' | 'driver' | 'passenger';

// Users Table
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").unique().notNull(),
  phoneNumber: text("phone_number").notNull(),
  role: text("role", { enum: ['admin', 'driver', 'passenger'] as const }).notNull().default('passenger'),
  isActive: boolean("is_active").default(true),
  isApproved: boolean("is_approved").default(false),
  referralCode: text("referral_code").unique(),
  referredBy: integer("referred_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations after table definitions
export const usersRelations = relations(users, ({ one }) => ({
  referredByUser: one(users, {
    fields: [users.referredBy],
    references: [users.id],
  }),
}));

// Fleet Categories Table
export const fleetCategories = pgTable("fleet_categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description"),
  basePrice: decimal("base_price").notNull(),
  hourlyRate: decimal("hourly_rate").notNull(),
  perMileRate: decimal("per_mile_rate").notNull(),
  minHours: integer("min_hours").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Locations Table
export const locations = pgTable("locations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  isActive: boolean("is_active").default(true),
  priceMultiplier: decimal("price_multiplier").default("1.0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pricing Rules Table
export const pricingRules = pgTable("pricing_rules", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  categoryId: integer("category_id").references(() => fleetCategories.id),
  locationId: integer("location_id").references(() => locations.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // distance, hourly, special_event
  conditions: json("conditions").notNull(), // min_distance, max_distance, min_hours, etc.
  multiplier: decimal("multiplier").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coupons Table
export const coupons = pgTable("coupons", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: text("code").unique().notNull(),
  description: text("description"),
  discountType: text("discount_type").notNull(), // percentage, fixed
  discountValue: decimal("discount_value").notNull(),
  minBookingAmount: decimal("min_booking_amount"),
  maxDiscount: decimal("max_discount"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vehicles Table
export const vehicles = pgTable("vehicles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  categoryId: integer("category_id").references(() => fleetCategories.id),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: text("year").notNull(),
  licensePlate: text("license_plate").unique().notNull(),
  capacity: integer("capacity").notNull(),
  currentLocationId: integer("current_location_id").references(() => locations.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chauffeurs Table
export const chauffeurs = pgTable("chauffeurs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  licenseNumber: text("license_number").unique().notNull(),
  experienceYears: integer("experience_years").notNull(),
  rating: decimal("rating"),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookings Table
export const bookings = pgTable("bookings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tripId: text("trip_id").unique().notNull(),
  userId: integer("user_id").references(() => users.id),
  accountId: text("account_id"),
  
  // Billing and Company Information
  billingContact: text("billing_contact"),
  companyName: text("company_name"),
  
  // Passenger Information
  passengerFirstName: text("passenger_first_name").notNull(),
  passengerLastName: text("passenger_last_name").notNull(),
  passengerPhone: text("passenger_phone").notNull(),
  passengerEmail: text("passenger_email").notNull(),
  passengerCount: integer("passenger_count").default(1),
  poClientRef: text("po_client_ref"), // PO/Client Reference Number
  
  // Pickup and Dropoff Details
  pickupDate: timestamp("pickup_date").notNull(),
  pickupTime: text("pickup_time").notNull(),
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  duration: integer("duration"), // Duration in hours for hourly bookings
  
  // Airport Information
  airportCode: text("airport_code"),
  airportName: text("airport_name"),
  airlineCode: text("airline_code"),
  airlineName: text("airline_name"),
  flightNumber: text("flight_number"),
  
  // Trip Details
  tripNotes: text("trip_notes"),
  status: text("status", {
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
  }).default('pending'),
  jobStatus: text("job_status", { 
    enum: ['unassigned', 'assigned', 'dispatched', 'on_the_way', 'arrived', 
           'passenger_on_board', 'passenger_dropped_off', 'done'] 
  }).default('unassigned'),
  paymentStatus: text("payment_status", {
    enum: ['pending', 'paid', 'refunded', 'failed']
  }).default('pending'),
  additionalRequests: json("additional_requests").default([]), // Array of requests like child seat, booster, etc.
  
  // Service and Vehicle Details
  serviceType: text("service_type").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  chauffeurId: integer("chauffeur_id").references(() => chauffeurs.id),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  categoryId: integer("category_id").references(() => fleetCategories.id),
  
  // Pricing Breakdown
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  gratuityFee: decimal("gratuity_fee", { precision: 10, scale: 2 }).default('0'),
  extraStopsFee: decimal("extra_stops_fee", { precision: 10, scale: 2 }).default('0'),
  discount: decimal("discount", { precision: 10, scale: 2 }).default('0'),
  tolls: decimal("tolls", { precision: 10, scale: 2 }).default('0'),
  parking: decimal("parking", { precision: 10, scale: 2 }).default('0'),
  creditCardFee: decimal("credit_card_fee", { precision: 10, scale: 2 }).default('0'),
  grandTotal: decimal("grand_total", { precision: 10, scale: 2 }).notNull(),
  paymentsDeposits: decimal("payments_deposits", { precision: 10, scale: 2 }).default('0'),
  totalDue: decimal("total_due", { precision: 10, scale: 2 }).notNull(),
  
  // Location Tracking
  trackingEnabled: boolean("tracking_enabled").default(false),
  lastKnownLatitude: decimal("last_known_latitude", { precision: 10, scale: 7 }),
  lastKnownLongitude: decimal("last_known_longitude", { precision: 10, scale: 7 }),
  lastLocationUpdate: timestamp("last_location_update"),
  estimatedArrivalTime: timestamp("estimated_arrival_time"),
  
  // System Fields
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews Table
export const reviews = pgTable("reviews", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  bookingId: integer("booking_id").references(() => bookings.id),
  fromUserId: integer("from_user_id").references(() => users.id),
  toUserId: integer("to_user_id").references(() => users.id),
  type: text("type").notNull(), // passenger_to_driver, driver_to_passenger
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Location tracking table
export const locationTracking = pgTable("location_tracking", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  chauffeurId: integer("chauffeur_id").references(() => chauffeurs.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  status: text("status", { enum: ['active', 'inactive'] }).notNull().default('active'),
  speed: decimal("speed", { precision: 5, scale: 2 }),
  heading: decimal("heading", { precision: 5, scale: 2 }),
});

// Export schemas and types
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;

export const insertFleetCategorySchema = createInsertSchema(fleetCategories);
export const selectFleetCategorySchema = createSelectSchema(fleetCategories);
export type InsertFleetCategory = z.infer<typeof insertFleetCategorySchema>;
export type FleetCategory = z.infer<typeof selectFleetCategorySchema>;

export const insertVehicleSchema = createInsertSchema(vehicles);
export const selectVehicleSchema = createSelectSchema(vehicles);
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = z.infer<typeof selectVehicleSchema>;

export const insertLocationSchema = createInsertSchema(locations);
export const selectLocationSchema = createSelectSchema(locations);
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = z.infer<typeof selectLocationSchema>;

export const insertPricingRuleSchema = createInsertSchema(pricingRules);
export const selectPricingRuleSchema = createSelectSchema(pricingRules);
export type InsertPricingRule = z.infer<typeof insertPricingRuleSchema>;
export type PricingRule = z.infer<typeof selectPricingRuleSchema>;

export const insertCouponSchema = createInsertSchema(coupons);
export const selectCouponSchema = createSelectSchema(coupons);
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = z.infer<typeof selectCouponSchema>;

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

export const insertLocationTrackingSchema = createInsertSchema(locationTracking);
export const selectLocationTrackingSchema = createSelectSchema(locationTracking);
export type InsertLocationTracking = z.infer<typeof insertLocationTrackingSchema>;
export type LocationTracking = z.infer<typeof selectLocationTrackingSchema>;