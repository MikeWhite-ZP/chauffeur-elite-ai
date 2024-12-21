import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

interface Achievement {
  id: number;
  name: string;
  description: string;
  badgeIcon: string;
  points: number;
  earnedAt?: string;
}

interface AchievementStats {
  totalAchievements: number;
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  recentAchievements: Achievement[];
}

export function DriverAchievementsWidget() {
  const { data: stats, isLoading } = useQuery<AchievementStats>({
    queryKey: ["driver-achievements"],
    queryFn: async () => {
      const response = await fetch("/api/driver/achievements");
      if (!response.ok) {
        throw new Error("Failed to fetch achievement stats");
      }
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
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
        <CardTitle className="text-xl font-semibold">Your Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Achievement Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats?.totalAchievements || 0}</p>
              <p className="text-sm text-muted-foreground">Total Badges</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats?.totalPoints || 0}</p>
              <p className="text-sm text-muted-foreground">Points Earned</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats?.currentStreak || 0}</p>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats?.bestStreak || 0}</p>
              <p className="text-sm text-muted-foreground">Best Streak</p>
            </div>
          </div>

          {/* Recent Achievements */}
          <div>
            <h3 className="font-medium mb-4">Recent Achievements</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stats?.recentAchievements?.map((achievement) => (
                <TooltipProvider key={achievement.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative group cursor-pointer">
                        <div className="w-16 h-16 mx-auto bg-accent rounded-lg flex items-center justify-center">
                          <span className="text-2xl">{achievement.badgeIcon}</span>
                        </div>
                        {achievement.earnedAt && (
                          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                            New!
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-2 p-2">
                        <p className="font-medium">{achievement.name}</p>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <p className="text-sm font-medium">{achievement.points} points</p>
                        {achievement.earnedAt && (
                          <p className="text-xs text-muted-foreground">
                            Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
