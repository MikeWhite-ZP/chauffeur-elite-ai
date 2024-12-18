import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Heart, Clock, Coffee, Activity } from "lucide-react";

interface WellnessMetrics {
  hoursWorkedToday: number;
  hoursWorkedWeek: number;
  lastBreakTime: string | null;
  breaksTaken: number;
  restHoursLast24h: number;
  routeComplexityScore: number;
  trafficStressScore: number;
  wellnessScore: number;
}

interface WellnessScoreWidgetProps {
  metrics: WellnessMetrics;
  className?: string;
}

export function WellnessScoreWidget({ metrics }: WellnessScoreWidgetProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getBreakStatus = () => {
    if (!metrics.lastBreakTime) return "No breaks taken yet";
    const lastBreak = new Date(metrics.lastBreakTime);
    const now = new Date();
    const hoursSinceBreak = (now.getTime() - lastBreak.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceBreak > 4) return "Break recommended";
    return `Last break ${Math.round(hoursSinceBreak * 10) / 10}h ago`;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Driver Wellness Score
        </CardTitle>
        <CardDescription>
          Monitor your health and performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-gray-200"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className={getScoreColor(metrics.wellnessScore)}
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
                strokeDasharray={`${(metrics.wellnessScore / 100) * 251.2} 251.2`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className={`text-2xl font-bold ${getScoreColor(metrics.wellnessScore)}`}>
                {Math.round(metrics.wellnessScore)}%
              </div>
              <div className="text-xs text-gray-500">Wellness Score</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <div className="text-sm">
                      <div className="font-medium">{metrics.hoursWorkedToday}h Today</div>
                      <div className="text-xs text-gray-500">{metrics.hoursWorkedWeek}h This Week</div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hours worked tracking</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <Coffee className="h-4 w-4 text-orange-500" />
                    <div className="text-sm">
                      <div className="font-medium">{metrics.breaksTaken} Breaks</div>
                      <div className="text-xs text-gray-500">{getBreakStatus()}</div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Break time tracking</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <Activity className="h-4 w-4 text-purple-500" />
                    <div className="text-sm">
                      <div className="font-medium">Stress Level</div>
                      <Progress 
                        value={((metrics.routeComplexityScore + metrics.trafficStressScore) / 2) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Based on route complexity and traffic conditions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <Heart className="h-4 w-4 text-red-500" />
                    <div className="text-sm">
                      <div className="font-medium">Rest Hours</div>
                      <div className="text-xs text-gray-500">
                        {metrics.restHoursLast24h}h in 24h
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rest hours in the last 24 hours</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
