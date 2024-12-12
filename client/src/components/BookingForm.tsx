import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type BookingFormData = {
  serviceType: 'hourly' | 'point-to-point' | 'airport' | 'event' | 'corporate';
  pickupDate: string;
  pickupTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  userId?: number | string;
  passengerCount: number | string;
  totalFare: number | string;
  specialRequests?: string;
};

interface BookingFormProps {
  isAdminForm?: boolean;
  onSuccess?: () => void;
}

export default function BookingForm({ isAdminForm = false, onSuccess }: BookingFormProps) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<BookingFormData>({
    defaultValues: {
      serviceType: undefined,
      pickupDate: '',
      pickupTime: '',
      pickupLocation: '',
      dropoffLocation: '',
      passengerCount: '',
      totalFare: '',
      specialRequests: ''
    }
  });
  const { toast } = useToast();

  const onSubmit = async (data: BookingFormData) => {
    try {
      const endpoint = isAdminForm ? '/api/admin/bookings' : '/api/passenger/bookings';
      
      // Format the data before submission
      const formattedData = {
        ...data,
        userId: isAdminForm ? parseInt(data.userId as unknown as string) : undefined,
        passengerCount: parseInt(data.passengerCount as unknown as string),
        totalFare: parseFloat(data.totalFare as unknown as string),
        serviceType: data.serviceType, // Ensure this is included
      };
      
      console.log('Submitting booking data:', formattedData);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Booking submission failed:', errorText);
        throw new Error('Failed to submit booking');
      }

      const result = await response.json();
      console.log('Booking submission successful:', result);

      toast({
        title: isAdminForm ? "Booking Created" : "Booking Request Received",
        description: isAdminForm ? "New booking has been created successfully." : "We'll confirm your booking shortly.",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      toast({
        title: "Error",
        description: `Failed to ${isAdminForm ? 'create' : 'submit'} booking request. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isAdminForm && (
        <div className="space-y-2">
          <Label htmlFor="userId">Customer ID</Label>
          <Input
            type="number"
            id="userId"
            {...register("userId", { required: true })}
            placeholder="Enter customer ID"
          />
          {errors.userId && (
            <p className="text-sm text-red-500">Customer ID is required</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="serviceType">Service Type</Label>
        <Select
          onValueChange={(value) => {
            register("serviceType").onChange({
              target: { name: "serviceType", value }
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hourly">Hourly Service</SelectItem>
            <SelectItem value="point-to-point">Point-to-Point Transfer</SelectItem>
            <SelectItem value="airport">Airport Transfer</SelectItem>
            <SelectItem value="event">Event Transportation</SelectItem>
            <SelectItem value="corporate">Corporate Service</SelectItem>
          </SelectContent>
        </Select>
        {errors.serviceType && (
          <p className="text-sm text-red-500">Please select a service type</p>
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

      <div className="space-y-2">
        <Label htmlFor="dropoffLocation">Drop-off Location</Label>
        <Input
          type="text"
          id="dropoffLocation"
          placeholder="Enter drop-off address"
          {...register("dropoffLocation", { required: true })}
        />
        {errors.dropoffLocation && (
          <p className="text-sm text-red-500">Drop-off location is required</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="passengerCount">Number of Passengers</Label>
        <Input
          type="number"
          id="passengerCount"
          {...register("passengerCount", { 
            required: true,
            min: 1,
            max: 15
          })}
          min={1}
          max={15}
        />
        {errors.passengerCount && (
          <p className="text-sm text-red-500">Valid passenger count is required (1-15)</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalFare">Total Fare ($)</Label>
        <Input
          type="number"
          id="totalFare"
          step="0.01"
          {...register("totalFare", { 
            required: true,
            min: 0
          })}
        />
        {errors.totalFare && (
          <p className="text-sm text-red-500">Valid fare amount is required</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialRequests">Special Requests</Label>
        <textarea
          id="specialRequests"
          className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register("specialRequests")}
          placeholder="Any special requirements or notes"
        />
      </div>

      <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90">
        {isAdminForm ? "Create Booking" : "Request Booking"}
      </Button>
    </form>
  );
}