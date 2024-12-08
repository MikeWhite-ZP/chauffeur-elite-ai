import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

const destinationSchema = z.object({
  from: z.string().min(1, "From address is required"),
  to: z.string().min(1, "To address is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});

const hourlySchema = z.object({
  from: z.string().min(1, "From address is required"),
  duration: z.string().min(1, "Duration is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});

export default function BookingWidget() {
  const destinationForm = useForm<z.infer<typeof destinationSchema>>({
    resolver: zodResolver(destinationSchema),
  });

  const hourlyForm = useForm<z.infer<typeof hourlySchema>>({
    resolver: zodResolver(hourlySchema),
  });

  const [showStopInput, setShowStopInput] = React.useState(false);

  const onDestinationSubmit = (data: z.infer<typeof destinationSchema>) => {
    console.log("Destination booking:", data);
  };

  const onHourlySubmit = (data: z.infer<typeof hourlySchema>) => {
    console.log("Hourly booking:", data);
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

              <FormField
                control={destinationForm.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <Label>Time</Label>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <FormField
                control={hourlyForm.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <Label>Time</Label>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
