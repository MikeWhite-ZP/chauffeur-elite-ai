import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLocation } from "../hooks/use-location";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "../hooks/use-user";
import { insertBookingSchema } from "@db/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type BookingFormData = {
  pickupLocation: string;
  dropoffLocation: string;
  serviceClass: "Business Class" | "First Class";
  date: string;
};

export default function BookingForm() {
  const { register, handleSubmit, watch } = useForm<BookingFormData>();
  const { getCurrentLocation } = useLocation();
  const { toast } = useToast();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          userId: user?.id,
          fare: calculateFare(data),
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({
        title: "Booking Confirmed",
        description: "Your chauffeur has been booked successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const calculateFare = (data: BookingFormData) => {
    // Simple fare calculation
    const baseRate = data.serviceClass === "First Class" ? 150 : 100;
    return baseRate;
  };

  const serviceClass = watch("serviceClass");

  return (
    <form onSubmit={handleSubmit((data) => bookingMutation.mutate(data))} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="pickupLocation">Pickup Location</Label>
        <div className="flex gap-2">
          <Input
            id="pickupLocation"
            {...register("pickupLocation", { required: true })}
          />
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const location = await getCurrentLocation();
              if (location) {
                // Set the input value
              }
            }}
          >
            Current Location
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dropoffLocation">Dropoff Location</Label>
        <Input
          id="dropoffLocation"
          {...register("dropoffLocation", { required: true })}
        />
      </div>

      <div className="space-y-2">
        <Label>Service Class</Label>
        <RadioGroup defaultValue="Business Class">
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="Business Class"
              id="business"
              {...register("serviceClass")}
            />
            <Label htmlFor="business">Business Class</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="First Class"
              id="first"
              {...register("serviceClass")}
            />
            <Label htmlFor="first">First Class</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date and Time</Label>
        <Input
          id="date"
          type="datetime-local"
          {...register("date", { required: true })}
        />
      </div>

      <div className="pt-4 border-t">
        <div className="flex justify-between mb-4">
          <span>Estimated Fare</span>
          <span className="font-semibold">
            ${calculateFare({ serviceClass } as BookingFormData)}
          </span>
        </div>
        <Button type="submit" className="w-full" disabled={bookingMutation.isPending}>
          {bookingMutation.isPending ? "Processing..." : "Confirm Booking"}
        </Button>
      </div>
    </form>
  );
}
