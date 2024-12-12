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
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import BookingForm from "@/components/BookingForm";
import { toast } from "@/hooks/use-toast";

import type { Booking } from "@db/schema";

// Additional fields needed for the UI
interface BookingWithDetails extends Booking {
  driverName?: string;
  passengerName?: string;
}

export default function BookingManagement() {
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
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update booking status");
      }

      toast({
        title: "Success",
        description: "Booking status updated successfully",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
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
          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" className="ml-auto">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add new booking</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Booking</DialogTitle>
                <DialogDescription>
                  Create a new booking for a customer. Fill in all the required information below.
                </DialogDescription>
              </DialogHeader>
              <BookingForm isAdminForm={true} onSuccess={() => refetch()} />
            </DialogContent>
          </Dialog>
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
                    Booking #{booking.id}
                  </h3>
                  <p className="text-sm">
                    From: {booking.pickupLocation}
                  </p>
                  <p className="text-sm">
                    To: {booking.dropoffLocation}
                  </p>
                  <p className="text-sm">
                    Date: {new Date(booking.pickupDate).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    Passengers: {booking.passengerCount}
                  </p>
                  <p className="text-sm">
                    Fare: ${Number(booking.totalFare).toFixed(2)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Select
                    defaultValue={booking.status || undefined}
                    onValueChange={(value) => handleStatusChange(booking.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // TODO: Implement view details
                    }}
                  >
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
