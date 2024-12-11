import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type InsertBooking } from "@db/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Plus } from "lucide-react";

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
});

const hourlySchema = z.object({
  from: z.string().min(1, "From address is required"),
  duration: z.string().min(1, "Duration is required"),
  date: z.string().min(1, "Date is required"),
  time: timeSchema,
});

export default function BookingWidget() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const destinationForm = useForm<z.infer<typeof destinationSchema>>({
    resolver: zodResolver(destinationSchema),
  });

  const hourlyForm = useForm<z.infer<typeof hourlySchema>>({
    resolver: zodResolver(hourlySchema),
  });

  const [showStopInput, setShowStopInput] = React.useState(false);

  const { mutate: createBooking, isPending: isLoading } = useMutation({
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

  const onDestinationSubmit = async (data: z.infer<typeof destinationSchema>) => {
    const bookingData: Partial<InsertBooking> = {
      serviceType: "destination",
      pickupLocation: data.from,
      dropoffLocation: data.to,
      pickupDate: new Date(`${data.date} ${data.time.hour}:${data.time.minute} ${data.time.period}`),
      passengerCount: 1,
      // Add other required fields from schema with proper string types for decimal values
      basePrice: "0",
      totalFare: "0",
      status: "pending",
      paymentStatus: "pending",
      stops: [],
    };

    createBooking(bookingData);
  };

  const onHourlySubmit = async (data: z.infer<typeof hourlySchema>) => {
    const bookingData: Partial<InsertBooking> = {
      serviceType: "hourly",
      pickupLocation: data.from,
      dropoffLocation: data.from, // Same as pickup for hourly
      pickupDate: new Date(`${data.date} ${data.time.hour}:${data.time.minute} ${data.time.period}`),
      duration: parseInt(data.duration),
      passengerCount: 1,
      // Add other required fields from schema with proper string types for decimal values
      basePrice: "0",
      totalFare: "0",
      status: "pending",
      paymentStatus: "pending",
      stops: [],
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
                      <Input placeholder="Enter pickup address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showStopInput && (
                <FormItem>
                  <Label>Stop</Label>
                  <FormControl>
                    <Input placeholder="Enter stop address" />
                  </FormControl>
                </FormItem>
              )}

              <div className="text-sm">
                <button
                  type="button"
                  className="text-primary flex items-center gap-1"
                  onClick={() => setShowStopInput(true)}
                >
                  <Plus className="h-4 w-4" /> Add Stop
                </button>
              </div>

              <FormField
                control={destinationForm.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <Label>To</Label>
                    <FormControl>
                      <Input placeholder="Enter dropoff address" {...field} />
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

              <FormItem>
                <Label>Time</Label>
                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    control={destinationForm.control}
                    name="time.hour"
                    render={({ field }) => (
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
                    )}
                  />
                  <FormField
                    control={destinationForm.control}
                    name="time.minute"
                    render={({ field }) => (
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
                    )}
                  />
                  <FormField
                    control={destinationForm.control}
                    name="time.period"
                    render={({ field }) => (
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
                    )}
                  />
                </div>
                <FormMessage />
              </FormItem>

              <p className="text-xs text-muted-foreground">
                Chauffeur will wait 15 minutes free of charge
              </p>

              <Button type="submit" className="w-full">
                Search
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
                    <Label>From</Label>
                    <FormControl>
                      <Input placeholder="Enter pickup address" {...field} />
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
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="3">3 hours</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="5">5 hours</SelectItem>
                        <SelectItem value="6">6 hours</SelectItem>
                        <SelectItem value="7">7 hours</SelectItem>
                        <SelectItem value="8">8 hours</SelectItem>
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

              <FormItem>
                <Label>Time</Label>
                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    control={hourlyForm.control}
                    name="time.hour"
                    render={({ field }) => (
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
                    )}
                  />
                  <FormField
                    control={hourlyForm.control}
                    name="time.minute"
                    render={({ field }) => (
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
                    )}
                  />
                  <FormField
                    control={hourlyForm.control}
                    name="time.period"
                    render={({ field }) => (
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
                    )}
                  />
                </div>
                <FormMessage />
              </FormItem>

              <Button type="submit" className="w-full">
                Search
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
