import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Star, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface DriverStats {
  chauffeurId: number;
  fullName: string;
  totalPoints: number;
  level: number;
  rank: number;
  totalTrips: number;
  completedTrips: number;
  averageRating: number;
  currentStreak: number;
  bestStreak: number;
}

export function DriverLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<DriverStats[]>([]);
  
  const { data, isLoading } = useQuery<DriverStats[]>({
    queryKey: ["driver-leaderboard"],
    queryFn: async () => {
      const response = await fetch("/api/driver/leaderboard");
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard data");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const ws = new WebSocket(`ws://${window.location.host}/ws`);

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      if (update.type === 'leaderboard_update') {
        setLeaderboard(update.data);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  // Use WebSocket updates if available, otherwise fall back to query data
  const displayData = leaderboard.length > 0 ? leaderboard : data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Star className="h-5 w-5 text-slate-400" />;
    }
  };

  const calculateLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Driver Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayData.map((driver) => (
            <div
              key={driver.chauffeurId}
              className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(driver.rank)}
                </div>
                <div>
                  <h3 className="font-medium">{driver.fullName}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">Level {calculateLevel(driver.totalPoints)}</Badge>
                    <span>{driver.totalPoints} XP</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  Trips: {driver.completedTrips}/{driver.totalTrips}
                </div>
                <div className="text-sm">
                  Rating: {driver.averageRating.toFixed(1)} ⭐
                </div>
              </div>
            </div>
          ))}
          {displayData.length === 0 && (
            <div className="text-center text-muted-foreground">
              No driver data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
