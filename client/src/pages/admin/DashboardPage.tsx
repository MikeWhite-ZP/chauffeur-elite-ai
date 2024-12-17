import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Users,
  Car,
  Calendar,
  TrendingUp,
  Clock
} from "lucide-react";

interface DashboardStats {
  activeDrivers: number;
  totalBookings: number;
  activeVehicles: number;
  pendingApprovals: number;
  revenue: number;
  upcomingBookings: number;
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/dashboard/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const cards = [
    {
      title: "Active Drivers",
      value: stats?.activeDrivers || 0,
      icon: <Users className="h-4 w-4 text-blue-600" />,
      href: "/admin/driver-approvals"
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: <Calendar className="h-4 w-4 text-green-600" />,
      href: "/admin/booking-management"
    },
    {
      title: "Active Vehicles",
      value: stats?.activeVehicles || 0,
      icon: <Car className="h-4 w-4 text-purple-600" />,
      href: "/admin/fleet-management"
    },
    {
      title: "Pending Approvals",
      value: stats?.pendingApprovals || 0,
      icon: <Clock className="h-4 w-4 text-yellow-600" />,
      href: "/admin/driver-approvals"
    },
    {
      title: "Revenue",
      value: `$${stats?.revenue?.toLocaleString() || 0}`,
      icon: <TrendingUp className="h-4 w-4 text-emerald-600" />,
      href: "/admin/reports"
    },
    {
      title: "Upcoming Bookings",
      value: stats?.upcomingBookings || 0,
      icon: <BarChart3 className="h-4 w-4 text-red-600" />,
      href: "/admin/booking-management"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
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
      </div>
    </div>
  );
}
