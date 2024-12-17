import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

import type { Booking } from "@db/schema";

// Additional fields needed for the UI
interface BookingWithDetails extends Omit<Booking, 'id'> {
  id: number;
  tripId: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: Date;
  pickupTime: string;
  passengerFirstName: string;
  passengerLastName: string;
  driverName?: string;
  jobStatus: string;
  grandTotal: string;
  totalDue: string;
}

const JOB_STATUSES = [
  "unassigned",
  "assigned",
  "dispatched",
  "on the way",
  "arrived",
  "passenger on board",
  "passenger dropped off",
  "done"
] as const;

export default function BookingManagement() {
  const [, setLocation] = useLocation();
  const { data: bookings, isLoading, refetch } = useQuery<BookingWithDetails[]>({
    queryKey: ["all-bookings"],
    queryFn: async () => {
      console.log('Fetching bookings...');
      const response = await fetch("/api/admin/bookings");
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch bookings:', errorText);
        throw new Error("Failed to fetch bookings");
      }
      const data = await response.json();
      console.log('Fetched bookings:', data);
      return data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds to ensure we see new bookings
  });

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      console.log('Updating booking status:', { bookingId, newStatus });
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobStatus: newStatus }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update status:', errorText);
        throw new Error("Failed to update booking status");
      }

      await refetch();
      toast({
        title: "Success",
        description: "Booking status updated successfully",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (bookingId: number) => {
    setLocation(`/admin/booking-management/${bookingId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Booking Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 w-2/3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-9 w-[180px]" />
                    <Skeleton className="h-9 w-[180px]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Booking Management</CardTitle>
          <Button size="icon" className="ml-auto" onClick={() => setLocation("/admin/booking-management/new")}>
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add new booking</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings?.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-2">
                  <h3 className="font-medium">
                    Trip #{booking.tripId}
                  </h3>
                  <p className="text-sm">
                    From: {booking.pickupLocation}
                  </p>
                  <p className="text-sm">
                    To: {booking.dropoffLocation}
                  </p>
                  <p className="text-sm">
                    Date: {new Date(booking.pickupDate).toLocaleDateString()} {booking.pickupTime}
                  </p>
                  <p className="text-sm">
                    Passenger: {booking.passengerFirstName} {booking.passengerLastName}
                  </p>
                  <p className="text-sm">
                    Driver: {booking.driverName || 'Not assigned'}
                  </p>
                  <p className="text-sm">
                    Total: ${Number(booking.grandTotal).toFixed(2)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Select
                    value={booking.jobStatus || undefined}
                    onValueChange={(value) => handleStatusChange(booking.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    className="w-[180px]"
                    onClick={() => handleViewDetails(booking.id)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
            {bookings?.length === 0 && (
              <p className="text-center text-gray-500">No bookings found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
