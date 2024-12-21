import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Car, Users, Calendar, TrendingUp } from "lucide-react";

interface FleetMetrics {
  totalVehicles: number;
  activeVehicles: number;
  availableVehicles: number;
  totalBookings: number;
  ongoingRides: number;
  averageUtilization: number;
}

export function FleetInsightsWidget() {
  const { data: metrics, isLoading } = useQuery<FleetMetrics>({
    queryKey: ["fleet-metrics"],
    queryFn: async () => {
      const response = await fetch("/api/admin/fleet/metrics");
      if (!response.ok) {
        throw new Error("Failed to fetch fleet metrics");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-border" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Fleet Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Car className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Vehicles</p>
              <p className="text-2xl font-bold">{metrics?.totalVehicles || 0}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Available Vehicles</p>
              <p className="text-2xl font-bold">{metrics?.availableVehicles || 0}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ongoing Rides</p>
              <p className="text-2xl font-bold">{metrics?.ongoingRides || 0}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Utilization Rate</p>
              <p className="text-2xl font-bold">{metrics?.averageUtilization || 0}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
