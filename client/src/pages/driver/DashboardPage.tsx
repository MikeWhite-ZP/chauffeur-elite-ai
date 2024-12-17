import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Car, Star, Calendar, MapPin } from "lucide-react";

interface DriverStats {
  todayAssignments: number;
  rating: number;
  completedTrips: number;
  onTimePercentage: number;
  currentStatus: 'available' | 'busy' | 'offline';
}

export default function DriverDashboard() {
  const { data: stats, isLoading } = useQuery<DriverStats>({
    queryKey: ["driver-stats"],
    queryFn: async () => {
      const response = await fetch("/api/driver/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch driver stats");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const cards = [
    {
      title: "Today's Assignments",
      value: stats?.todayAssignments || 0,
      icon: <Calendar className="h-4 w-4 text-blue-600" />,
      href: "/driver/my-assignments"
    },
    {
      title: "Rating",
      value: `${stats?.rating?.toFixed(1) || "0.0"}/5.0`,
      icon: <Star className="h-4 w-4 text-yellow-600" />,
      href: "/driver/leaderboard"
    },
    {
      title: "Completed Trips",
      value: stats?.completedTrips || 0,
      icon: <Car className="h-4 w-4 text-green-600" />,
      href: "/driver/history"
    },
    {
      title: "On-Time Performance",
      value: `${stats?.onTimePercentage || 0}%`,
      icon: <MapPin className="h-4 w-4 text-purple-600" />,
      href: "/driver/stats"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Status:</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
            ${stats?.currentStatus === 'available' ? 'bg-green-100 text-green-800' :
              stats?.currentStatus === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
            }`}>
            {stats?.currentStatus || 'offline'}
          </span>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>
    </div>
  );
}
