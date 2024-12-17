import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock } from "lucide-react";

interface Booking {
  id: number;
  tripId: string;
  pickupDate: string;
  pickupTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: string;
  vehicleType: string;
}

export default function BookingHistory() {
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["passenger-bookings"],
    queryFn: async () => {
      const response = await fetch("/api/passenger/bookings");
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Booking History</h1>
      </div>

      <div className="grid gap-6">
        {bookings?.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Trip #{booking.tripId}</span>
                <span className="text-sm font-normal px-2 py-1 bg-gray-100 rounded">
                  {booking.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{new Date(booking.pickupDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">{booking.pickupTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Pickup</p>
                    <p className="text-sm text-gray-500">{booking.pickupLocation}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Dropoff</p>
                    <p className="text-sm text-gray-500">{booking.dropoffLocation}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Vehicle Type</p>
                    <p className="text-sm text-gray-500">{booking.vehicleType}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
