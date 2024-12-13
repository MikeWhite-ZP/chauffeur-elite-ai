import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus } from "lucide-react";
import { type InsertBooking } from "@db/schema";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import React from "react";


const timeSchema = z.object({
  hour: z.string().min(1, "Hour is required"),
  minute: z.string().min(1, "Minute is required"),
  period: z.string().min(1, "AM/PM is required"),
});

const destinationSchema = z.object({
  from: z.string().min(1, "From address is required"),
  to: z.string().min(1, "To address is required"),
  date: z.string().min(1, "Date is required"),
  time: timeSchema,
  stop: z.string().optional(),
});

const hourlySchema = z.object({
  from: z.string().min(1, "From address is required"),
  duration: z.string().min(1, "Duration is required"),
  date: z.string().min(1, "Date is required"),
  time: timeSchema,
});

interface LocationData {
  address: string;
  position: { lat: number; lon: number } | null;
}

export default function BookingWidget() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [stops, setStops] = useState<string[]>([]);
  const [showStopInput, setShowStopInput] = useState(false);
  const [pickupCoords, setPickupCoords] = React.useState<{ lat: number; lon: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = React.useState<{ lat: number; lon: number } | null>(null);

  const destinationForm = useForm<z.infer<typeof destinationSchema> & { fromLocation: LocationData; toLocation: LocationData; } >({
    resolver: zodResolver(destinationSchema),
    defaultValues: {
      from: "",
      to: "",
      date: "",
      time: { hour: "", minute: "", period: "" },
      stop: "",
      fromLocation: { address: "", position: null },
      toLocation: { address: "", position: null },
    },
  });

  const hourlyForm = useForm<z.infer<typeof hourlySchema> & { fromLocation: LocationData; } >({
    resolver: zodResolver(hourlySchema),
    defaultValues: {
      from: "",
      duration: "",
      date: "",
      time: { hour: "", minute: "", period: "" },
      fromLocation: { address: "", position: null },
    },
  });

  const { mutate: createBooking, isPending: isSubmitting } = useMutation({
    mutationFn: async (bookingData: Partial<InsertBooking>) => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });
      if (!response.ok) {
        throw new Error("Failed to create booking");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your booking has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const handleAddStop = (stop: string) => {
    if (stop && stop.trim()) {
      setStops([...stops, stop.trim()]);
      setShowStopInput(false);
      destinationForm.setValue('stop', '');
    }
  };

  const onDestinationSubmit = async (data: z.infer<typeof destinationSchema> & { fromLocation: LocationData; toLocation: LocationData; }) => {
    const pickupDateTime = new Date(`${data.date} ${data.time.hour}:${data.time.minute} ${data.time.period}`);
    const bookingData: Partial<InsertBooking> = {
      serviceType: "destination",
      pickupLocation: data.from,
      dropoffLocation: data.to,
      pickupDate: pickupDateTime,
      passengerFirstName: "John", // TODO: Get from form
      passengerLastName: "Doe", // TODO: Get from form
      passengerPhone: "1234567890", // TODO: Get from form
      passengerEmail: "john@example.com", // TODO: Get from form
      passengerCount: 1,
      basePrice: "100.00",
      grandTotal: "100.00",
      totalDue: "100.00",
      status: "pending",
      paymentStatus: "pending",
      additionalRequests: stops.length > 0 ? stops : [],
      trackingEnabled: true,
      pickupLatitude: data.fromLocation.position?.lat.toString(),
      pickupLongitude: data.fromLocation.position?.lon.toString(),
      dropoffLatitude: data.toLocation.position?.lat.toString(),
      dropoffLongitude: data.toLocation.position?.lon.toString(),

    };

    createBooking(bookingData);
  };

  const onHourlySubmit = async (data: z.infer<typeof hourlySchema> & { fromLocation: LocationData; }) => {
    const pickupDateTime = new Date(`${data.date} ${data.time.hour}:${data.time.minute} ${data.time.period}`);
    const bookingData: Partial<InsertBooking> = {
      serviceType: "hourly",
      pickupLocation: data.from,
      dropoffLocation: data.from,
      pickupDate: pickupDateTime,
      pickupTime: `${data.time.hour}:${data.time.minute} ${data.time.period}`,
      duration: parseInt(data.duration),
      passengerFirstName: "John", // TODO: Get from form
      passengerLastName: "Doe", // TODO: Get from form
      passengerPhone: "1234567890", // TODO: Get from form
      passengerEmail: "john@example.com", // TODO: Get from form
      passengerCount: 1,
      basePrice: "75.00",
      grandTotal: (75.00 * parseInt(data.duration)).toString(),
      totalDue: (75.00 * parseInt(data.duration)).toString(),
      status: "pending",
      paymentStatus: "pending",
      additionalRequests: [],
      trackingEnabled: true,
      pickupLatitude: data.fromLocation.position?.lat.toString(),
      pickupLongitude: data.fromLocation.position?.lon.toString(),
    };

    createBooking(bookingData);
  };

  return (
    <div className="w-full max-w-[300px] bg-white rounded-lg shadow-xl p-4">
      <Tabs defaultValue="destination" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="destination">Destination</TabsTrigger>
          <TabsTrigger value="hourly">Hourly</TabsTrigger>
        </TabsList>

        <TabsContent value="destination">
          <Form {...destinationForm}>
            <form onSubmit={destinationForm.handleSubmit(onDestinationSubmit)} className="space-y-4">
              <FormField
                control={destinationForm.control}
                name="from"
                render={({ field }) => (
                  <FormItem>
                    <Label>From</Label>
                    <FormControl>
                      <AddressAutocomplete
                        value={field.value}
                        onChange={(value, position) => {
                          field.onChange(value);
                          destinationForm.setValue('fromLocation', {address: value, position});
                          setPickupCoords(position);
                        }}
                        placeholder="Enter pickup address"
                        useGeolocation={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {stops.map((stop, index) => (
                <FormItem key={index}>
                  <Label>Stop {index + 1}</Label>
                  <Input value={stop} disabled />
                </FormItem>
              ))}

              {showStopInput && (
                <FormField
                  control={destinationForm.control}
                  name="stop"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Add Stop</Label>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter stop address"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => field.value && handleAddStop(field.value)}
                        >
                          Add
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {!showStopInput && (
                <div className="text-sm">
                  <button
                    type="button"
                    className="text-primary flex items-center gap-1"
                    onClick={() => setShowStopInput(true)}
                  >
                    <Plus className="h-4 w-4" /> Add Stop
                  </button>
                </div>
              )}

              <FormField
                control={destinationForm.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <Label>To</Label>
                    <FormControl>
                      <AddressAutocomplete
                        value={field.value}
                        onChange={(value, position) => {
                          field.onChange(value);
                          destinationForm.setValue('toLocation', {address: value, position});
                          setDropoffCoords(position);
                        }}
                        placeholder="Enter dropoff address"
                        useGeolocation={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={destinationForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <Label>Date</Label>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={destinationForm.control}
                  name="time.hour"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => (
                            <SelectItem key={i} value={String(i + 1)}>{i + 1}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={destinationForm.control}
                  name="time.minute"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Min" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => (
                            <SelectItem key={i} value={String(i * 5)}>{String(i * 5).padStart(2, '0')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={destinationForm.control}
                  name="time.period"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="AM/PM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating booking...
                  </span>
                ) : (
                  "Book Now"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="hourly">
          <Form {...hourlyForm}>
            <form onSubmit={hourlyForm.handleSubmit(onHourlySubmit)} className="space-y-4">
              <FormField
                control={hourlyForm.control}
                name="from"
                render={({ field }) => (
                  <FormItem>
                    <Label>Pickup Location</Label>
                    <FormControl>
                      <AddressAutocomplete
                        value={field.value}
                        onChange={(value, position) => {
                          field.onChange(value);
                          hourlyForm.setValue('fromLocation', {address: value, position});
                          setPickupCoords(position);
                        }}
                        placeholder="Enter pickup address"
                        useGeolocation={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={hourlyForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <Label>Duration</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[2, 3, 4, 5, 6, 7, 8].map((hours) => (
                          <SelectItem key={hours} value={String(hours)}>
                            {hours} hours
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={hourlyForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <Label>Date</Label>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={hourlyForm.control}
                  name="time.hour"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => (
                            <SelectItem key={i} value={String(i + 1)}>{i + 1}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={hourlyForm.control}
                  name="time.minute"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Min" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => (
                            <SelectItem key={i} value={String(i * 5)}>{String(i * 5).padStart(2, '0')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={hourlyForm.control}
                  name="time.period"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="AM/PM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating booking...
                  </span>
                ) : (
                  "Book Now"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}