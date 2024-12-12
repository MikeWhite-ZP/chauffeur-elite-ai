import { z } from "zod";

export const jobStatusEnum = [
  'unassigned',
  'assigned',
  'dispatched',
  'on_the_way',
  'arrived',
  'passenger_on_board',
  'passenger_dropped_off',
  'done',
  'pending',
  'in_progress'
] as const;

export type JobStatus = typeof jobStatusEnum[number];

export const serviceTypeEnum = [
  'hourly',
  'point-to-point',
  'airport',
  'event',
  'corporate'
] as const;

export type ServiceType = typeof serviceTypeEnum[number];

export const vehicleTypeEnum = [
  'sedan',
  'suv',
  'van',
  'sprinter'
] as const;

export type VehicleType = typeof vehicleTypeEnum[number];

export const bookingFormSchema = z.object({
  id: z.number().optional(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
  basePrice: z.string().default("0"),
  categoryId: z.number().nullable().optional(),
  userId: z.number().nullable().optional(),
  tripId: z.string().default(() => Math.random().toString(36).substr(2, 9).toUpperCase()),
  accountId: z.string().nullable().optional(),
  billingContact: z.string().nullable().optional(),
  companyName: z.string().nullable().optional(),
  passengerFirstName: z.string().min(1, "First name is required"),
  passengerLastName: z.string().min(1, "Last name is required"),
  passengerPhone: z.string().min(10, "Valid phone number is required"),
  passengerEmail: z.string().email("Valid email is required"),
  poClientRef: z.string().nullable().optional(),
  pickupDate: z.date(),
  pickupTime: z.string(),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  dropoffLocation: z.string().min(1, "Dropoff location is required"),
  airportCode: z.string().nullable().optional(),
  airportName: z.string().nullable().optional(),
  airlineCode: z.string().nullable().optional(),
  airlineName: z.string().nullable().optional(),
  flightNumber: z.string().nullable().optional(),
  tripNotes: z.string().nullable().optional(),
  jobStatus: z.enum(jobStatusEnum).default('unassigned'),
  additionalRequests: z.array(z.string()).default([]),
  serviceType: z.enum(serviceTypeEnum),
  vehicleType: z.enum(vehicleTypeEnum),
  chauffeurId: z.number().nullable().optional(),
  vehicleId: z.number().nullable().optional(),
  gratuityFee: z.string().default('0'),
  extraStopsFee: z.string().default('0'),
  discount: z.string().default('0'),
  tolls: z.string().default('0'),
  parking: z.string().default('0'),
  creditCardFee: z.string().default('0'),
  grandTotal: z.string().default('0'),
  paymentsDeposits: z.string().default('0'),
  totalDue: z.string().default('0'),
  trackingEnabled: z.boolean().default(false),
  lastKnownLatitude: z.number().nullable().optional(),
  lastKnownLongitude: z.number().nullable().optional(),
  lastLocationUpdate: z.date().nullable().optional(),
  estimatedArrivalTime: z.date().nullable().optional(),
  driverName: z.string().optional(),
  passengerCount: z.number().default(1),
  status: z.string().default('pending'),
  duration: z.number().optional(),
  totalFare: z.string().default('0'),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

export const jobStatusOptions = jobStatusEnum;
