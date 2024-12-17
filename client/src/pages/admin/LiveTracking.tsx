import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TrackingMap from '@/components/TrackingMap';
import { useQuery } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";
import DailyBookings from '@/components/DailyBookings';

interface ActiveBooking {
  id: number;
  chauffeur_id: number;
  user_id: number;
  status: string;
  pickup_location: string;
  dropoff_location: string;
  last_known_latitude: string;
  last_known_longitude: string;
  vehicle_id: number;
  service_type: string;
  tracking_enabled: boolean;
  estimated_arrival_time?: string | null;
  chauffeur?: {
    full_name: string;
  };
  vehicle?: {
    make: string;
    model: string;
    license_plate: string;
  };
  user?: {
    full_name: string;
  };
}

export default function LiveTracking() {
  const { data: activeBookings, isLoading, error } = useQuery<ActiveBooking[]>({
    queryKey: ['admin', 'active-bookings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/active-bookings', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch active bookings');
      }
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Tracking Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-[500px] w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Error loading active bookings</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Live Tracking Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeBookings && activeBookings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {activeBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="font-semibold">Booking #{booking.id}</p>
                            <Badge 
                              variant={
                                booking.status === 'in_progress' ? 'default' :
                                booking.status === 'completed' ? 'success' :
                                booking.status === 'cancelled' ? 'destructive' :
                                'secondary'
                              }
                            >
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {booking.tracking_enabled ? 'Live Tracking' : 'No Tracking'}
                            </Badge>
                            {booking.estimated_arrival_time && (
                              <Badge variant="outline" className="text-xs">
                                ETA: {new Date(booking.estimated_arrival_time).toLocaleTimeString()}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Driver: {booking.chauffeur?.full_name || 'Unassigned'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Passenger: {booking.user?.full_name || 'Unknown'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Vehicle: {booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.license_plate})` : 'Unassigned'}
                            </p>
                          </div>
                          <div className="pt-2 text-sm">
                            <p className="font-medium">Pickup: {booking.pickup_location}</p>
                            <p className="font-medium">Dropoff: {booking.dropoff_location}</p>
                            {booking.estimated_arrival_time && (
                              <p className="font-medium text-primary">
                                ETA: {new Date(booking.estimated_arrival_time).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {activeBookings.map((booking) => (
                  booking.last_known_latitude && booking.last_known_longitude && (
                    <div key={booking.id} className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">
                        Tracking Booking #{booking.id} - {booking.chauffeur?.full_name}
                      </h3>
                      <TrackingMap
                        bookingId={booking.id}
                        initialPosition={{
                          lat: parseFloat(booking.last_known_latitude),
                          lng: parseFloat(booking.last_known_longitude)
                        }}
                      />
                    </div>
                  )
                ))}
              </>
            ) : (
              <DailyBookings />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
