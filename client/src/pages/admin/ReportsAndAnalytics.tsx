import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Analytics {
  bookings: {
    daily: Array<{ date: string; count: number; revenue: number }>;
    byCategory: Array<{ category: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
  };
  revenue: {
    total: number;
    lastMonth: number;
    growth: number;
  };
  users: {
    total: number;
    active: number;
    byRole: Array<{ role: string; count: number }>;
  };
}

export default function ReportsAndAnalytics() {
  const { data, isLoading } = useQuery<Analytics>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await fetch("/api/admin/analytics");
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data?.revenue.total.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              {data?.revenue.growth >= 0 ? "+" : ""}
              {data?.revenue.growth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.users.total}</div>
            <div className="text-sm text-gray-500">
              {data?.users.active} active users
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                data?.bookings.byStatus.find(
                  (status) => status.status === "in_progress"
                )?.count || 0
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Daily Bookings & Revenue</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.bookings.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="count"
                  name="Bookings"
                  stroke="#8884d8"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#82ca9d"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bookings by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.bookings.byCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
