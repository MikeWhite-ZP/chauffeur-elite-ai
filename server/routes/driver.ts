import { Router } from "express";
import { db } from "../db";
import { 
  driverPerformanceMetrics, 
  driverEarnedAchievements, 
  driverAchievements,
  chauffeurs,
  users 
} from "@db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

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

router.get("/leaderboard", async (req, res) => {
  try {
    console.log('Fetching driver performance data...');
    const performanceData = await db
      .select({
        id: chauffeurs.id,
        driverName: users.fullName,
        totalTrips: driverPerformanceMetrics.totalTrips,
        completedTrips: driverPerformanceMetrics.completedTrips,
        averageRating: driverPerformanceMetrics.averageRating,
        onTimePercentage: driverPerformanceMetrics.onTimePercentage,
        totalPoints: driverPerformanceMetrics.totalPoints,
      })
      .from(driverPerformanceMetrics)
      .innerJoin(chauffeurs, eq(driverPerformanceMetrics.chauffeurId, chauffeurs.id))
      .innerJoin(users, eq(chauffeurs.userId, users.id))
      .orderBy(desc(driverPerformanceMetrics.totalPoints));

    // Fetch achievements for each driver
    console.log('Found performance data:', performanceData);
    const driversWithAchievements = await Promise.all(
      performanceData.map(async (driver) => {
        console.log('Fetching achievements for driver:', driver.id);
        const achievements = await db
          .select({
            id: driverAchievements.id,
            name: driverAchievements.name,
            description: driverAchievements.description,
            badgeIcon: driverAchievements.badgeIcon,
            points: driverAchievements.points,
            earnedAt: driverEarnedAchievements.earnedAt,
          })
          .from(driverEarnedAchievements)
          .innerJoin(
            driverAchievements,
            eq(driverEarnedAchievements.achievementId, driverAchievements.id)
          )
          .where(eq(driverEarnedAchievements.chauffeurId, driver.id || 0));

        const [level, nextLevelPoints] = calculateLevel(driver.totalPoints);
        return {
          ...driver,
          ranking: performanceData.findIndex((d) => d.id === driver.id) + 1,
          achievements,
          level,
          nextLevelPoints,
        };
      })
    );

    res.json(driversWithAchievements);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard data" });
  }
});

export default router;
