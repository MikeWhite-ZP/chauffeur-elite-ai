import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Trash2 } from "lucide-react";
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

// Schema definitions
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

// Reusable TimeSelect Component
const TimeSelect = ({ control, namePrefix }: { control: any; namePrefix: string }) => (
  <div className="grid grid-cols-3 gap-2">
    {["hour", "minute", "period"].map((field) => (
      <FormField
        key={field}
        control={control}
        name={`${namePrefix}.${field}`}
        render={({ field: selectField }) => (
          <FormItem>
            <Select onValueChange={selectField.onChange} defaultValue={selectField.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={field === "period" ? "AM/PM" : field} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {field === "hour" &&
                  [...Array(12)].map((_, i) => (
                    <SelectItem key={i} value={String(i + 1)}>
                      {i + 1}
                    </SelectItem>
                  ))}
                {field === "minute" &&
                  [...Array(12)].map((_, i) => (
                    <SelectItem key={i} value={String(i * 5)}>
                      {String(i * 5).padStart(2, "0")}
                    </SelectItem>
                  ))}
                {field === "period" && (
                  <>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
    ))}
  </div>
);

export default function BookingWidget() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [stops, setStops] = useState<string[]>([]);
  const [showStopInput, setShowStopInput] = useState(false);

  // Forms
  const destinationForm = useForm({
    resolver: zodResolver(destinationSchema),
    defaultValues: {
      from: "",
      to: "",
      date: "",
      time: { hour: "", minute: "", period: "" },
      stop: "",
    },
  });

  const hourlyForm = useForm({
    resolver: zodResolver(hourlySchema),
    defaultValues: {
      from: "",
      duration: "",
      date: "",
      time: { hour: "", minute: "", period: "" },
    },
  });

  const { mutate: createBooking, isPending: isSubmitting } = useMutation({
    mutationFn: async (bookingData: Partial<InsertBooking>) => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });
      if (!response.ok) throw new Error("Failed to create booking");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Booking created successfully!" });
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
    if (stop.trim()) {
      setStops([...stops, stop.trim()]);
      setShowStopInput(false);
      destinationForm.setValue("stop", "");
    }
  };

  const handleRemoveStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const onSubmit = (data: any) => {
    const bookingData = { ...data, stops }; // Example logic
    createBooking(bookingData);
  };

  return (
    <div className="w-full max-w-[300px] bg-white rounded-lg shadow-xl p-4">
      <Tabs defaultValue="destination" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="destination">Destination</TabsTrigger>
          <TabsTrigger value="hourly">Hourly</TabsTrigger>
        </TabsList>

        {/* Destination Form */}
        <TabsContent value="destination">
          <Form {...destinationForm}>
            <form onSubmit={destinationForm.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={destinationForm.control}
                name="from"
                render={({ field }) => (
                  <FormItem>
                    <Label>From</Label>
                    <FormControl>
                      <AddressAutocomplete {...field} placeholder="Pickup address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stops */}
              {stops.map((stop, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={stop} disabled />
                  <Button
                    variant="ghost"
                    onClick={() => handleRemoveStop(index)}
                    title="Remove Stop"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {showStopInput && (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Add stop address"
                    {...destinationForm.register("stop")}
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      handleAddStop(destinationForm.getValues("stop"))
                    }
                  >
                    Add
                  </Button>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
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
