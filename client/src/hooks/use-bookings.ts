import { useQuery } from "@tanstack/react-query";
import type { Booking } from "@db/schema";

import { UseQueryResult } from "@tanstack/react-query";

export function useBookings(): UseQueryResult<Booking[], Error> & { bookings: Booking[] | undefined } {
  const query = useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: async () => {
      const response = await fetch("/api/bookings", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      return response.json();
    },
  });

  return {
    ...query,
    bookings: query.data,
  };
}
