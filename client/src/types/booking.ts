import { z } from "zod";
import { bookings } from "@db/schema";

export const bookingFormSchema = z.object({
  ...bookings,
  passengerCount: z.string().optional(),
  totalFare: z.string().optional(),
  userId: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;
