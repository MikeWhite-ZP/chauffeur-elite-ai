import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation, useParams } from "wouter";
import { ArrowLeft } from "lucide-react";
import BookingForm from "@/components/BookingForm";
import { BookingFormData } from "@/types/booking";

interface BookingWithDetails extends BookingFormData {
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
      const data = await response.json();
      console.log('Fetched booking data:', data);
      return {
        ...data,
        pickupDate: new Date(data.pickupDate),
        serviceType: data.serviceType || undefined,
        vehicleType: data.vehicleType || undefined,
        basePrice: data.basePrice?.toString() || "0",
        gratuityFee: data.gratuityFee?.toString() || "0",
        extraStopsFee: data.extraStopsFee?.toString() || "0",
        discount: data.discount?.toString() || "0",
        tolls: data.tolls?.toString() || "0",
        parking: data.parking?.toString() || "0",
        creditCardFee: data.creditCardFee?.toString() || "0",
        paymentsDeposits: data.paymentsDeposits?.toString() || "0",
        lastLocationUpdate: data.lastLocationUpdate ? new Date(data.lastLocationUpdate) : null,
        estimatedArrivalTime: data.estimatedArrivalTime ? new Date(data.estimatedArrivalTime) : null,
        createdAt: data.createdAt ? new Date(data.createdAt) : null,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : null,
      };
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
            defaultValues={booking}
          />
        </CardContent>
      </Card>
    </div>
  );
}
