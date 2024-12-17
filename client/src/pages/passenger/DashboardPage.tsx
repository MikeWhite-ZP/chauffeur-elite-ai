import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, History, Car } from "lucide-react";
import { Link } from "wouter";

interface PassengerStats {
  upcomingRides: number;
  completedRides: number;
  favoriteVehicles: string[];
  lastBooking: {
    date: string;
    vehicleType: string;
    status: string;
  } | null;
}

export default function PassengerDashboard() {
  const { data: stats, isLoading } = useQuery<PassengerStats>({
    queryKey: ["passenger-stats"],
    queryFn: async () => {
      const response = await fetch("/api/passenger/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch passenger stats");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const cards = [
    {
      title: "Upcoming Rides",
      value: stats?.upcomingRides || 0,
      icon: <Calendar className="h-4 w-4 text-blue-600" />,
      href: "/passenger/bookings"
    },
    {
      title: "Completed Rides",
      value: stats?.completedRides || 0,
      icon: <History className="h-4 w-4 text-green-600" />,
      href: "/passenger/history"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/passenger/new-booking">
          <Button>
            <Car className="mr-2 h-4 w-4" />
            Book a Ride
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}

        {stats?.lastBooking && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Last Booking
              </CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Date: {new Date(stats.lastBooking.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Vehicle: {stats.lastBooking.vehicleType}
                </p>
                <p className="text-sm text-gray-500">
                  Status: {stats.lastBooking.status}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
