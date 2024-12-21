import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock, Unlock, Star, Trophy, Shield, Navigation2 } from "lucide-react";
import { useState } from "react";

interface Skill {
  id: number;
  name: string;
  description: string;
  category: string;
  tier: string;
  xpRequired: number;
  icon: string;
  benefits: string[];
  isUnlocked: boolean;
  currentXp: number;
  requirements: {
    id: number;
    name: string;
    isUnlocked: boolean;
  }[];
}

interface SkillCategory {
  name: string;
  icon: React.ReactNode;
  skills: Skill[];
}

export function DriverSkillTree() {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const { data: skillTree, isLoading } = useQuery<SkillCategory[]>({
    queryKey: ["driver-skills"],
    queryFn: async () => {
      const response = await fetch("/api/driver/skills");
      if (!response.ok) {
        throw new Error("Failed to fetch skill tree");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const categoryIcons = {
    safety: <Shield className="h-5 w-5" />,
    customer_service: <Star className="h-5 w-5" />,
    navigation: <Navigation2 className="h-5 w-5" />,
    vehicle_knowledge: <Trophy className="h-5 w-5" />,
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skillTree?.map((category) => (
          <Card key={category.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {categoryIcons[category.name as keyof typeof categoryIcons]}
                {category.name.replace("_", " ").toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.skills.map((skill) => (
                  <TooltipProvider key={skill.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            p-4 rounded-lg border cursor-pointer transition-all
                            ${
                              skill.isUnlocked
                                ? "bg-accent hover:bg-accent/80"
                                : "bg-muted/50 hover:bg-muted"
                            }
                            ${
                              skill.requirements.some((req) => !req.isUnlocked)
                                ? "opacity-50"
                                : ""
                            }
                          `}
                          onClick={() => setSelectedSkill(skill)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {skill.isUnlocked ? (
                                <Unlock className="h-4 w-4 text-green-500" />
                              ) : (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="font-medium">{skill.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {skill.tier}
                            </span>
                          </div>
                          <Progress
                            value={(skill.currentXp / skill.xpRequired) * 100}
                            className="h-2"
                          />
                          <div className="mt-2 text-xs text-right text-muted-foreground">
                            {skill.currentXp} / {skill.xpRequired} XP
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium">{skill.name}</h4>
                          <p className="text-sm">{skill.description}</p>
                          {skill.requirements.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Requirements:</p>
                              <ul className="text-sm list-disc list-inside">
                                {skill.requirements.map((req) => (
                                  <li
                                    key={req.id}
                                    className={
                                      req.isUnlocked
                                        ? "text-green-500"
                                        : "text-muted-foreground"
                                    }
                                  >
                                    {req.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSkill && (
        <Card>
          <CardHeader>
            <CardTitle>Skill Details: {selectedSkill.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>{selectedSkill.description}</p>
              <div>
                <h4 className="font-medium mb-2">Benefits:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedSkill.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              {!selectedSkill.isUnlocked && (
                <Button
                  className="w-full"
                  disabled={selectedSkill.requirements.some(
                    (req) => !req.isUnlocked
                  )}
                >
                  Unlock Skill
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
