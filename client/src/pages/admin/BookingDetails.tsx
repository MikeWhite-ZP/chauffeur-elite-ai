import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Edit, Trash2, Ban } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import type { Booking } from "@db/schema";

interface BookingWithDetails extends Booking {
  driverName?: string;
}

export default function BookingDetails() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const bookingId = params.id ? parseInt(params.id) : 0;

  const { data: booking, isLoading, refetch } = useQuery<BookingWithDetails>({
    queryKey: ["booking-details", bookingId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch booking details");
      }
      return response.json();
    },
  });

  const handleEdit = () => {
    setLocation(`/admin/booking-management/${bookingId}/edit`);
  };

  const handleCancel = async () => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      await refetch();
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete booking");
      }

      setLocation("/admin/booking-management");
      toast({
        title: "Success",
        description: "Booking deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast({
        title: "Error",
        description: "Failed to delete booking. Please try again.",
        variant: "destructive",
      });
    }
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/admin/booking-management")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Booking Details - Trip #{booking.tripId}</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleEdit}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Ban className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this booking? This action will mark the booking as cancelled.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, keep it</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>
                    Yes, cancel booking
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this booking? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, keep it</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Yes, delete booking
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Passenger Information</h3>
              <div className="space-y-2">
                <p>Name: {booking.passengerFirstName} {booking.passengerLastName}</p>
                <p>Phone: {booking.passengerPhone}</p>
                <p>Email: {booking.passengerEmail}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Trip Information</h3>
              <div className="space-y-2">
                <p>From: {booking.pickupLocation}</p>
                <p>To: {booking.dropoffLocation}</p>
                <p>Date: {new Date(booking.pickupDate).toLocaleDateString()}</p>
                <p>Time: {booking.pickupTime}</p>
                <p>Status: {booking.jobStatus}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Additional Information</h3>
              <div className="space-y-2">
                <p>Service Type: {booking.serviceType}</p>
                <p>Vehicle Type: {booking.vehicleType}</p>
                <p>Driver: {booking.driverName || 'Not assigned'}</p>
                <p>Additional Requests: {Array.isArray(booking.additionalRequests) ? booking.additionalRequests.join(', ') : 'None'}</p>
                <p>Trip Notes: {booking.tripNotes || 'None'}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Payment Information</h3>
              <div className="space-y-2">
                <p>Base Price: ${Number(booking.basePrice).toFixed(2)}</p>
                <p>Gratuity Fee: ${Number(booking.gratuityFee).toFixed(2)}</p>
                <p>Extra Stops Fee: ${Number(booking.extraStopsFee).toFixed(2)}</p>
                <p>Discount: ${Number(booking.discount).toFixed(2)}</p>
                <p>Tolls: ${Number(booking.tolls).toFixed(2)}</p>
                <p>Parking: ${Number(booking.parking).toFixed(2)}</p>
                <p>Credit Card Fee: ${Number(booking.creditCardFee).toFixed(2)}</p>
                <p className="font-medium">Grand Total: ${Number(booking.grandTotal).toFixed(2)}</p>
                <p>Payments/Deposits: ${Number(booking.paymentsDeposits).toFixed(2)}</p>
                <p className="font-medium">Total Due: ${Number(booking.totalDue).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
