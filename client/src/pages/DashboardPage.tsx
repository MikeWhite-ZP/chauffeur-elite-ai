import { useBookings } from "../hooks/use-bookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { bookings, isLoading } = useBookings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="font-serif text-4xl mb-8">Your Bookings</h1>

        <div className="grid gap-6">
          {bookings?.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">
                  {format(new Date(booking.pickupDate), "PPP")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Pickup Location</p>
                    <p>{booking.pickupLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dropoff Location</p>
                    <p>{booking.dropoffLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Service Class</p>
                    <p>{booking.serviceType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fare</p>
                    <p>${Number(booking.totalFare).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="capitalize">{booking.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {bookings?.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No bookings found
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
