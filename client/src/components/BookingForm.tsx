import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
// Simple form components only
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
      serviceType: defaultValues?.serviceType ?? 'hourly',
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
      vehicleType: defaultValues?.vehicleType ?? 'sedan',
      tripNotes: defaultValues?.tripNotes || '',
      basePrice: defaultValues?.basePrice || "0",
      gratuityFee: defaultValues?.gratuityFee || "0",
      extraStopsFee: defaultValues?.extraStopsFee || "0",
      discount: defaultValues?.discount || "0",
      tolls: defaultValues?.tolls || "0",
      parking: defaultValues?.parking || "0",
      creditCardFee: defaultValues?.creditCardFee || "0",
      paymentsDeposits: defaultValues?.paymentsDeposits || "0",
      tripId: defaultValues?.tripId || '',
      userId: defaultValues?.userId,
      accountId: defaultValues?.accountId || '',
      categoryId: defaultValues?.categoryId || null,
      jobStatus: defaultValues?.jobStatus || 'unassigned',
      additionalRequests: defaultValues?.additionalRequests || [],
      grandTotal: "0",
      totalDue: "0"
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
              <FormItem>
                <FormLabel>Pick-Up Location</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter pick-up address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dropoffLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drop-off Location</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter drop-off address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tripNotes"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Trip Notes</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Any additional notes about the trip"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            <FormField
              control={form.control}
              name="companyName"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input {...field} value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Enter company name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billingContact"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Billing Contact</FormLabel>
                  <FormControl>
                    <Input {...field} value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Enter billing contact" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="poClientRef"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>PO/Client Reference #</FormLabel>
                  <FormControl>
                    <Input {...field} value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Enter reference number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Admin Section */}
        {isAdminForm && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Admin Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="userId"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Customer ID</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="Enter customer ID"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
