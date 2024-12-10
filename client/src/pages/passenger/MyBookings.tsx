import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Booking {
  id: number;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  status: string;
  vehicleType: string;
  driverName?: string;
  driverPhone?: string;
  fare: string;
}

export default function MyBookings() {
  const { data: bookings, isLoading, refetch } = useQuery<Booking[]>({
    queryKey: ["my-bookings"],
    queryFn: async () => {
      const response = await fetch("/api/passenger/bookings");
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      return response.json();
    },
  });

  const handleCancelBooking = async (bookingId: number) => {
    try {
      const response = await fetch(`/api/passenger/bookings/${bookingId}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings?.map((booking) => (
              <div
                key={booking.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Booking #{booking.id}</h3>
                  <Badge>{booking.status}</Badge>
                </div>
                <p className="text-sm text-gray-500">
                  Vehicle: {booking.vehicleType}
                </p>
                <p className="text-sm text-gray-500">
                  From: {booking.pickupLocation}
                </p>
                <p className="text-sm text-gray-500">
                  To: {booking.dropoffLocation}
                </p>
                <p className="text-sm text-gray-500">
                  Date: {new Date(booking.pickupDate).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Fare: ${Number(booking.fare).toFixed(2)}
                </p>
                {booking.driverName && (
                  <div className="pt-2 border-t">
                    <p className="text-sm">Driver: {booking.driverName}</p>
                    <p className="text-sm">Contact: {booking.driverPhone}</p>
                  </div>
                )}
                <div className="pt-4 flex justify-end space-x-2">
                  {booking.status === 'pending' && (
                    <Button
                      variant="destructive"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancel Booking
                    </Button>
                  )}
                  <Button variant="outline">View Details</Button>
                </div>
              </div>
            ))}
            {bookings?.length === 0 && (
              <p className="text-center text-gray-500">
                No bookings found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
