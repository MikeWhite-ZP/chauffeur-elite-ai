import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Car, Star, Calendar, MapPin, Award, Flame, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Achievement {
  id: number;
  name: string;
  description: string;
  badgeIcon: string;
  points: number;
}

interface DriverStats {
  todayAssignments: number;
  rating: number;
  completedTrips: number;
  onTimePercentage: number;
  currentStatus: 'available' | 'busy' | 'offline';
  currentStreak: number;
  bestStreak: number;
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
  recentAchievement?: Achievement;
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

  // Generate motivational message based on stats
  const getMotivationalMessage = (stats: DriverStats) => {
    if (stats.currentStreak > stats.bestStreak * 0.8) {
      return "You're on fire! Keep up this amazing streak!";
    }
    if (stats.onTimePercentage >= 95) {
      return "Excellent punctuality! Your reliability makes us proud!";
    }
    if (stats.rating >= 4.8) {
      return "Outstanding service! Your passengers love you!";
    }
    return "Every trip is an opportunity to shine!";
  };

  const cards = [
    {
      title: "Today's Assignments",
      value: stats?.todayAssignments || 0,
      icon: <Calendar className="h-4 w-4 text-blue-600" />,
      href: "/driver/my-assignments"
    },
    {
      title: "Driver Level",
      value: `Level ${stats?.level || 1}`,
      icon: <Award className="h-4 w-4 text-yellow-600" />,
      description: `${stats?.totalPoints || 0} points`,
      href: "/driver/leaderboard"
    },
    {
      title: "Current Streak",
      value: `${stats?.currentStreak || 0} days`,
      icon: <Flame className="h-4 w-4 text-orange-600" />,
      description: `Best: ${stats?.bestStreak || 0} days`,
      href: "/driver/stats"
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Daily Motivation
          </CardTitle>
          <CardDescription>{stats && getMotivationalMessage(stats)}</CardDescription>
        </CardHeader>
        {stats?.recentAchievement && (
          <CardContent>
            <div className="bg-primary/10 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
                <Award className="h-4 w-4" />
                New Achievement Unlocked!
              </div>
              <p className="text-sm text-muted-foreground">{stats.recentAchievement.description}</p>
            </div>
          </CardContent>
        )}
      </Card>

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
              {card.description && (
                <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
              )}
              {card.title === "Driver Level" && stats && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress to Level {stats.level + 1}</span>
                    <span>{stats.nextLevelPoints - stats.totalPoints} points needed</span>
                  </div>
                  <Progress 
                    value={(stats.totalPoints / stats.nextLevelPoints) * 100} 
                    className="h-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
