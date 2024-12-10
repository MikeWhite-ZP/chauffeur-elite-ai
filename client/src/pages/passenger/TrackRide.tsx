import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TrackingMap from '@/components/TrackingMap';
import { Loader2 } from 'lucide-react';

interface BookingDetails {
  id: number;
  driverName: string;
  vehicleModel: string;
  vehiclePlate: string;
  status: string;
  pickupAddress: string;
  dropoffAddress: string;
}

export default function TrackRide() {
  const { bookingId } = useParams();
  
  const { data: booking, isLoading, error } = useQuery<BookingDetails>({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) throw new Error('Failed to fetch booking details');
      return response.json();
    },
    enabled: !!bookingId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Failed to load booking details</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Track Your Ride</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Driver Details</h3>
              <p>Driver: {booking.driverName}</p>
              <p>Vehicle: {booking.vehicleModel}</p>
              <p>Plate: {booking.vehiclePlate}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Trip Details</h3>
              <p>Status: {booking.status}</p>
              <p>Pickup: {booking.pickupAddress}</p>
              <p>Dropoff: {booking.dropoffAddress}</p>
            </div>
          </div>
          <TrackingMap bookingId={parseInt(bookingId!, 10)} />
        </CardContent>
      </Card>
    </div>
  );
}
