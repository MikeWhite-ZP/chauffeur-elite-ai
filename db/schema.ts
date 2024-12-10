import { pgTable, text, integer, timestamp, decimal, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").unique().notNull(),
  phoneNumber: text("phone_number").notNull(),
  role: text("role").notNull().default('passenger'), // admin, driver, passenger
  isActive: boolean("is_active").default(true),
  referralCode: text("referral_code").unique(),
  referredBy: integer("referred_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
  userId: integer("user_id").references(() => users.id),
  chauffeurId: integer("chauffeur_id").references(() => chauffeurs.id),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  categoryId: integer("category_id").references(() => fleetCategories.id),
  locationId: integer("location_id").references(() => locations.id),
  couponId: integer("coupon_id").references(() => coupons.id),
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  stops: text("stops").array(),
  serviceType: text("service_type").notNull(), // hourly, destination
  pickupDate: timestamp("pickup_date").notNull(),
  returnDate: timestamp("return_date"),
  duration: integer("duration"), // in hours, for hourly bookings
  distance: decimal("distance"), // in miles, for destination bookings
  specialRequests: text("special_requests"),
  passengerCount: integer("passenger_count").notNull(),
  basePrice: decimal("base_price").notNull(),
  distancePrice: decimal("distance_price"),
  hourlyPrice: decimal("hourly_price"),
  locationMultiplier: decimal("location_multiplier"),
  discountAmount: decimal("discount_amount"),
  totalFare: decimal("total_fare").notNull(),
  status: text("status").default("pending"), // pending, confirmed, in_progress, completed, cancelled
  paymentStatus: text("payment_status").default("pending"),
  paymentMethod: text("payment_method"),
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
