import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import TrackingMap from './TrackingMap';

interface DailyBooking {
  id: number;
  pickup_location: string;
  dropoff_location: string;
  pickup_time: string;
  status: string;
  chauffeur?: {
    full_name: string;
  };
  user?: {
    full_name: string;
  };
  vehicle?: {
    make: string;
    model: string;
    license_plate: string;
  };
  pickup_latitude?: string;
  pickup_longitude?: string;
  dropoff_latitude?: string;
  dropoff_longitude?: string;
}

export default function DailyBookings() {
  const { data: bookings, isLoading, error } = useQuery<DailyBooking[]>({
    queryKey: ['admin', 'daily-bookings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/daily-bookings', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch daily bookings');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load daily bookings</p>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No upcoming bookings scheduled for today</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Today's Scheduled Bookings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Booking #{booking.id}</p>
                  <Badge>{booking.status}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Time: {new Date(booking.pickup_time).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Driver: {booking.chauffeur?.full_name || 'Unassigned'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vehicle: {booking.vehicle ? 
                      `${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.license_plate})` : 
                      'Unassigned'
                    }
                  </p>
                </div>
                <div className="pt-2 space-y-1">
                  <p className="text-sm font-medium">From: {booking.pickup_location}</p>
                  <p className="text-sm font-medium">To: {booking.dropoff_location}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {bookings.map((booking) => (
        booking.pickup_latitude && booking.pickup_longitude && (
          <div key={booking.id} className="mt-6">
            <h3 className="text-lg font-semibold mb-2">
              Route for Booking #{booking.id}
            </h3>
            <TrackingMap
              bookingId={booking.id}
              initialPosition={{
                lat: parseFloat(booking.pickup_latitude),
                lng: parseFloat(booking.pickup_longitude)
              }}
              showRoute={true}
              destination={booking.dropoff_latitude && booking.dropoff_longitude ? {
                lat: parseFloat(booking.dropoff_latitude),
                lng: parseFloat(booking.dropoff_longitude)
              } : undefined}
            />
          </div>
        )
      ))}
    </div>
  );
}
