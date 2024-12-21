import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

interface Prediction {
  timestamp: string;
  predicted_value: number;
  confidence: number;
}

interface PredictionData {
  predictions: {
    rating: Prediction[];
    onTimePercentage: Prediction[];
    totalPoints: Prediction[];
  };
  featureImportance: Record<string, number>;
  historicalData: any[];
}

export function PerformancePredictionChart() {
  const { data, isLoading, error } = useQuery<PredictionData>({
    queryKey: ["performance-predictions"],
    queryFn: async () => {
      const response = await fetch("/api/driver/performance/predict");
      if (!response.ok) {
        throw new Error("Failed to fetch predictions");
      }
      return response.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-border" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            Error loading predictions
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Performance Predictions</CardTitle>
        <CardDescription>
          AI-powered predictions for the next 24 hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Rating Predictions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Predicted Rating</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data?.predictions.rating}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatDateTime}
                    interval={2}
                  />
                  <YAxis domain={[0, 5]} />
                  <Tooltip
                    labelFormatter={formatDateTime}
                    formatter={(value: number) => [value.toFixed(2), "Rating"]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="predicted_value"
                    name="Predicted Rating"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="confidence"
                    name="Confidence"
                    stroke="#6b7280"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* On-Time Percentage Predictions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Predicted On-Time Performance
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data?.predictions.onTimePercentage}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatDateTime}
                    interval={2}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    labelFormatter={formatDateTime}
                    formatter={(value: number) => [
                      `${value.toFixed(1)}%`,
                      "On-Time",
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="predicted_value"
                    name="Predicted On-Time %"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="confidence"
                    name="Confidence"
                    stroke="#6b7280"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feature Importance */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Prediction Factors</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(data?.featureImportance || {}).map(
                ([feature, importance]) => (
                  <div
                    key={feature}
                    className="bg-accent/20 rounded-lg p-4 text-center"
                  >
                    <p className="text-sm text-muted-foreground capitalize">
                      {feature.replace(/_/g, " ")}
                    </p>
                    <p className="text-lg font-semibold">
                      {(importance * 100).toFixed(1)}%
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
