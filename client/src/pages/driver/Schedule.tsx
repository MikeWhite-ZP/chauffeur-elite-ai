import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

interface ScheduledRide {
  id: number;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: Date;
  status: string;
  duration: string;
}

export default function Schedule() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: schedule, isLoading } = useQuery<ScheduledRide[]>({
    queryKey: ["driver-schedule", date],
    queryFn: async () => {
      const response = await fetch(`/api/driver/schedule?date=${date?.toISOString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch schedule");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule for {date?.toLocaleDateString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedule?.map((ride) => (
                <div
                  key={ride.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Trip #{ride.id}</h3>
                    <Badge>{ride.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Time: {new Date(ride.pickupDate).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    From: {ride.pickupLocation}
                  </p>
                  <p className="text-sm text-gray-500">
                    To: {ride.dropoffLocation}
                  </p>
                  <p className="text-sm text-gray-500">
                    Duration: {ride.duration}
                  </p>
                </div>
              ))}
              {schedule?.length === 0 && (
                <p className="text-center text-gray-500">
                  No rides scheduled for this day
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
