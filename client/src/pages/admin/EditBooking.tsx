import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation, useParams } from "wouter";
import { ArrowLeft } from "lucide-react";
import BookingForm from "@/components/BookingForm";

import type { Booking } from "@db/schema";

interface BookingWithDetails extends Booking {
  driverName?: string;
}

export default function EditBooking() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const bookingId = params.id ? parseInt(params.id) : undefined;

  const { data: booking, isLoading } = useQuery<BookingWithDetails>({
    queryKey: ["booking-details", bookingId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch booking details");
      }
      return response.json();
    },
  });

  const handleSuccess = () => {
    setLocation(`/admin/booking-management/${bookingId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Booking Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested booking could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation(`/admin/booking-management/${bookingId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Edit Booking - Trip #{booking.tripId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Edit booking information below.
          </p>
          <BookingForm 
            isAdminForm={true} 
            onSuccess={handleSuccess}
            defaultValues={{
              ...booking,
              userId: booking.userId?.toString(),
              pickupDate: new Date(booking.pickupDate),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
