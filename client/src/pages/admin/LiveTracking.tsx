import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TrackingMap from '@/components/TrackingMap';
import { useQuery } from '@tanstack/react-query';

interface ActiveBooking {
  id: number;
  driverId: number;
  passengerId: number;
  status: string;
  pickupLocation: string;
  dropoffLocation: string;
  lastKnownLatitude?: string;
  lastKnownLongitude?: string;
  driverName: string;
  passengerName: string;
}

export default function LiveTracking() {
  const { data: activeBookings, isLoading } = useQuery<ActiveBooking[]>({
    queryKey: ['active-bookings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/active-bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch active bookings');
      }
      return response.json();
    },
    refetchInterval: 10000 // Refresh every 10 seconds
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
                          <p className="font-semibold">Booking #{booking.id}</p>
                          <p className="text-sm text-muted-foreground">
                            Driver: {booking.driverName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Passenger: {booking.passengerName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Status: {booking.status}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {activeBookings.map((booking) => (
                  booking.lastKnownLatitude && booking.lastKnownLongitude && (
                    <div key={booking.id} className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">
                        Tracking Booking #{booking.id}
                      </h3>
                      <TrackingMap
                        bookingId={booking.id}
                        initialPosition={{
                          lat: parseFloat(booking.lastKnownLatitude),
                          lng: parseFloat(booking.lastKnownLongitude)
                        }}
                      />
                    </div>
                  )
                ))}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No active bookings to track</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
