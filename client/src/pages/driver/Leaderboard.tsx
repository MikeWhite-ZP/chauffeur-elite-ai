import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Clock, Award } from "lucide-react";

interface Achievement {
  id: number;
  name: string;
  description: string;
  badgeIcon: string;
  earnedAt: string;
  points: number;
}

interface DriverPerformance {
  id: number;
  driverName: string;
  ranking: number;
  totalTrips: number;
  completedTrips: number;
  averageRating: number;
  onTimePercentage: number;
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
  achievements: Achievement[];
}

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 5000, 10000];

function calculateLevel(points: number): [number, number] {
  let level = 1;
  let nextThreshold = LEVEL_THRESHOLDS[1];
  
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      nextThreshold = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i];
    } else {
      break;
    }
  }
  
  return [level, nextThreshold];
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
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Driver Leaderboard
            </CardTitle>
            <CardDescription>
              Compete with other drivers and earn achievements!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                {leaderboard?.map((driver) => (
                  <Card key={driver.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">
                              {driver.driverName}
                            </h3>
                            <Badge variant="outline" className="text-sm">
                              Level {driver.level}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Trophy className="h-4 w-4" />
                            Rank #{driver.ranking}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="text-lg mb-1 block">
                            {driver.totalPoints} pts
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Next level: {driver.nextLevelPoints - driver.totalPoints} pts needed
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" /> Rating
                              </span>
                              <span className="text-sm font-medium">
                                {driver.averageRating.toFixed(1)}/5.0
                              </span>
                            </div>
                            <Progress value={driver.averageRating * 20} className="bg-yellow-100" />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm flex items-center gap-1">
                                <Clock className="h-4 w-4 text-green-500" /> On-Time
                              </span>
                              <span className="text-sm font-medium">
                                {driver.onTimePercentage}%
                              </span>
                            </div>
                            <Progress value={driver.onTimePercentage} className="bg-green-100" />
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Award className="h-4 w-4 text-purple-500" />
                            Achievements
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {driver.achievements.map((achievement) => (
                              <Badge
                                key={achievement.id}
                                variant="outline"
                                className="px-2 py-1 hover:bg-accent cursor-help transition-colors"
                                title={`${achievement.description}\nPoints: ${achievement.points}\nEarned: ${new Date(
                                  achievement.earnedAt
                                ).toLocaleDateString()}`}
                              >
                                <span className="mr-1">{achievement.badgeIcon}</span>
                                {achievement.name}
                              </Badge>
                            ))}
                          </div>
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
