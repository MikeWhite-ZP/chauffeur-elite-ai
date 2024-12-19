import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { BookingFormData, bookingFormSchema } from "@/types/booking";

interface BookingFormProps {
  isAdminForm?: boolean;
  onSuccess?: () => void;
  defaultValues?: Partial<BookingFormData>;
}

export default function BookingForm({ isAdminForm = false, onSuccess, defaultValues }: BookingFormProps) {
  const { toast } = useToast();
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      ...defaultValues,
      pickupDate: defaultValues?.pickupDate ? new Date(defaultValues.pickupDate) : new Date(),
      vehicleType: defaultValues?.vehicleType ?? "sedan",
      serviceType: defaultValues?.serviceType ?? "hourly",
      grandTotal: "0",
      totalDue: "0",
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    const endpoint = isAdminForm ? "/api/admin/bookings" : "/api/passenger/bookings";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "An unknown error occurred");
      }

      const result = await response.json();
      toast({
        title: isAdminForm ? "Booking Created" : "Booking Request Sent",
        description: result.message || "Success",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process the booking.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Service Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Service Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="point-to-point">Point-to-Point</SelectItem>
                      <SelectItem value="airport">Airport Transfer</SelectItem>
                      <SelectItem value="event">Event Transportation</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Other Form Fields */}
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : isAdminForm ? "Create Booking" : "Request Booking"}
        </Button>
      </form>
    </Form>
  );
}
