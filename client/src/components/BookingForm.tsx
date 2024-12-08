import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type BookingFormData = {
  serviceType: string;
  pickupDate: string;
  pickupTime: string;
  pickupLocation: string;
};

export default function BookingForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<BookingFormData>();
  const { toast } = useToast();

  const onSubmit = async (data: BookingFormData) => {
    try {
      // TODO: Implement actual booking submission
      console.log('Booking data:', data);
      
      toast({
        title: "Booking Request Received",
        description: "We'll confirm your booking shortly.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit booking request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="serviceType">Service Type</Label>
        <Select {...register("serviceType", { required: true })}>
          <SelectTrigger>
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="business">Business Class</SelectItem>
            <SelectItem value="executive">Executive Class</SelectItem>
            <SelectItem value="luxury">Luxury Class</SelectItem>
          </SelectContent>
        </Select>
        {errors.serviceType && (
          <p className="text-sm text-red-500">Service type is required</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="pickupDate">Pick-Up Date</Label>
        <Input
          type="date"
          id="pickupDate"
          {...register("pickupDate", { required: true })}
          min={new Date().toISOString().split('T')[0]}
        />
        {errors.pickupDate && (
          <p className="text-sm text-red-500">Pick-up date is required</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="pickupTime">Pick-Up Time</Label>
        <Input
          type="time"
          id="pickupTime"
          {...register("pickupTime", { required: true })}
        />
        {errors.pickupTime && (
          <p className="text-sm text-red-500">Pick-up time is required</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="pickupLocation">Pick-Up Location</Label>
        <Input
          type="text"
          id="pickupLocation"
          placeholder="Enter pick-up address"
          {...register("pickupLocation", { required: true })}
        />
        {errors.pickupLocation && (
          <p className="text-sm text-red-500">Pick-up location is required</p>
        )}
      </div>

      <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90">
        Request Booking
      </Button>
    </form>
  );
}