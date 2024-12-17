import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface DriverPerformance {
  id: number;
  driverName: string;
  ranking: number;
  totalTrips: number;
  completedTrips: number;
  averageRating: number;
  onTimePercentage: number;
  totalPoints: number;
  achievements: {
    id: number;
    name: string;
    badgeIcon: string;
    earnedAt: string;
  }[];
}

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery<DriverPerformance[]>({
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Driver Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {leaderboard?.map((driver) => (
                  <Card key={driver.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {driver.driverName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Rank #{driver.ranking}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-lg">
                          {driver.totalPoints} pts
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Rating</span>
                            <span className="text-sm font-medium">
                              {driver.averageRating.toFixed(1)}/5.0
                            </span>
                          </div>
                          <Progress value={driver.averageRating * 20} />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">On-Time</span>
                            <span className="text-sm font-medium">
                              {driver.onTimePercentage}%
                            </span>
                          </div>
                          <Progress value={driver.onTimePercentage} />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {driver.achievements.map((achievement) => (
                            <Badge
                              key={achievement.id}
                              variant="outline"
                              className="px-2 py-1"
                              title={`${achievement.name}\nEarned: ${new Date(
                                achievement.earnedAt
                              ).toLocaleDateString()}`}
                            >
                              <span className="mr-1">{achievement.badgeIcon}</span>
                              {achievement.name}
                            </Badge>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Trips</p>
                            <p className="font-medium">{driver.totalTrips}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Completed Trips
                            </p>
                            <p className="font-medium">{driver.completedTrips}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievement Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Keep completing trips and maintaining high ratings to unlock more
                achievements!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
