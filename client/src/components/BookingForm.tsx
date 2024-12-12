import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import LocationAutocomplete from "./LocationAutocomplete";
import BookingFormMap from "./BookingFormMap";
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
      serviceType: defaultValues?.serviceType || '',
      pickupDate: defaultValues?.pickupDate ? new Date(defaultValues.pickupDate) : new Date(),
      pickupTime: defaultValues?.pickupTime || '',
      pickupLocation: defaultValues?.pickupLocation || '',
      dropoffLocation: defaultValues?.dropoffLocation || '',
      passengerFirstName: defaultValues?.passengerFirstName || '',
      passengerLastName: defaultValues?.passengerLastName || '',
      passengerPhone: defaultValues?.passengerPhone || '',
      passengerEmail: defaultValues?.passengerEmail || '',
      companyName: defaultValues?.companyName || '',
      billingContact: defaultValues?.billingContact || '',
      poClientRef: defaultValues?.poClientRef || '',
      vehicleType: defaultValues?.vehicleType || '',
      tripNotes: defaultValues?.tripNotes || '',
      basePrice: defaultValues?.basePrice || "0",
      gratuityFee: defaultValues?.gratuityFee || "0",
      extraStopsFee: defaultValues?.extraStopsFee || "0",
      discount: defaultValues?.discount || "0",
      tolls: defaultValues?.tolls || "0",
      parking: defaultValues?.parking || "0",
      creditCardFee: defaultValues?.creditCardFee || "0",
      paymentsDeposits: defaultValues?.paymentsDeposits || "0",
      tripId: defaultValues?.tripId || ''
    }
  });

  const onSubmit = async (data: BookingFormData) => {
    try {
      const endpoint = isAdminForm ? '/api/admin/bookings' : '/api/passenger/bookings';
      
      console.log('Submitting booking data:', data);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Booking submission failed:', errorData || await response.text());
        
        toast({
          title: "Error",
          description: errorData?.error || "Failed to submit booking. Please try again.",
          variant: "destructive",
        });
        return;
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Service Details */}
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
                      <SelectItem value="hourly">Hourly Service</SelectItem>
                      <SelectItem value="point-to-point">Point-to-Point Transfer</SelectItem>
                      <SelectItem value="airport">Airport Transfer</SelectItem>
                      <SelectItem value="event">Event Transportation</SelectItem>
                      <SelectItem value="corporate">Corporate Service</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vehicleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sedan">Luxury Sedan</SelectItem>
                      <SelectItem value="suv">Premium SUV</SelectItem>
                      <SelectItem value="van">Business Van</SelectItem>
                      <SelectItem value="sprinter">Sprinter</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Passenger Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Passenger Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="passengerFirstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter first name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passengerLastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter last name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passengerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="Enter phone number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passengerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="Enter email address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Company Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Company Information (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                type="text"
                id="companyName"
                {...form.register("companyName")}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <Label htmlFor="billingContact">Billing Contact</Label>
              <Input
                type="text"
                id="billingContact"
                {...form.register("billingContact")}
                placeholder="Enter billing contact"
              />
            </div>
            <div>
              <Label htmlFor="poClientRef">PO/Client Reference #</Label>
              <Input
                type="text"
                id="poClientRef"
                {...form.register("poClientRef")}
                placeholder="Enter reference number"
              />
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Trip Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pickupDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pick-Up Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        field.onChange(date);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pickupTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pick-Up Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

            <FormField
              control={form.control}
              name="pickupLocation"
              render={({ field }) => (
                <LocationAutocomplete
                  label="Pick-Up Location"
                  name={field.name}
                  placeholder="Enter pick-up address"
                />
              )}
            />

            <FormField
              control={form.control}
              name="dropoffLocation"
              render={({ field }) => (
                <LocationAutocomplete
                  label="Drop-off Location"
                  name={field.name}
                  placeholder="Enter drop-off address"
                />
              )}
            />

            <BookingFormMap
              pickupLocation={form.watch("pickupLocation")}
              dropoffLocation={form.watch("dropoffLocation")}
              className="w-full h-[400px] rounded-lg overflow-hidden mb-4"
            />

            <FormField
              control={form.control}
              name="tripNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip Notes</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Any additional notes about the trip"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Airport Information (Conditional) */}
        {form.watch("serviceType") === "airport" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Flight Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="airportCode">Airport Code</Label>
                <Input
                  type="text"
                  id="airportCode"
                  {...form.register("airportCode")}
                  placeholder="e.g., SFO"
                />
              </div>
              <div>
                <Label htmlFor="airportName">Airport Name</Label>
                <Input
                  type="text"
                  id="airportName"
                  {...form.register("airportName")}
                  placeholder="e.g., San Francisco International"
                />
              </div>
              <div>
                <Label htmlFor="airlineCode">Airline Code</Label>
                <Input
                  type="text"
                  id="airlineCode"
                  {...form.register("airlineCode")}
                  placeholder="e.g., UA"
                />
              </div>
              <div>
                <Label htmlFor="flightNumber">Flight Number</Label>
                <Input
                  type="text"
                  id="flightNumber"
                  {...form.register("flightNumber")}
                  placeholder="e.g., UA123"
                />
              </div>
            </div>
          </div>
        )}

        {/* Pricing Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pricing Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="basePrice">Base Price ($)</Label>
              <Input
                type="number"
                id="basePrice"
                step="0.01"
                {...form.register("basePrice", { required: true, min: 0 })}
              />
            </div>
            <div>
              <Label htmlFor="gratuityFee">Gratuity Fee ($)</Label>
              <Input
                type="number"
                id="gratuityFee"
                step="0.01"
                {...form.register("gratuityFee")}
              />
            </div>
            <div>
              <Label htmlFor="extraStopsFee">Extra Stops Fee ($)</Label>
              <Input
                type="number"
                id="extraStopsFee"
                step="0.01"
                {...form.register("extraStopsFee")}
              />
            </div>
            <div>
              <Label htmlFor="tolls">Tolls ($)</Label>
              <Input
                type="number"
                id="tolls"
                step="0.01"
                {...form.register("tolls")}
              />
            </div>
            <div>
              <Label htmlFor="parking">Parking ($)</Label>
              <Input
                type="number"
                id="parking"
                step="0.01"
                {...form.register("parking")}
              />
            </div>
            <div>
              <Label htmlFor="discount">Discount ($)</Label>
              <Input
                type="number"
                id="discount"
                step="0.01"
                {...form.register("discount")}
              />
            </div>
          </div>
        </div>

        {/* Admin Section */}
        {isAdminForm && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Admin Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="userId">Customer ID</Label>
                <Input
                  type="number"
                  id="userId"
                  {...form.register("userId", { required: true })}
                  placeholder="Enter customer ID"
                />
              </div>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full">
          {isAdminForm ? "Create Booking" : "Request Booking"}
        </Button>
      </form>
    </Form>
  );
}