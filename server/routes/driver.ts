import { Router } from "express";
import { db } from "../db";
import { 
  driverPerformanceMetrics, 
  driverEarnedAchievements, 
  driverAchievements,
  chauffeurs,
  users 
} from "@db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/leaderboard", async (req, res) => {
  try {
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
      .orderBy(driverPerformanceMetrics.totalPoints);

    // Fetch achievements for each driver
    const driversWithAchievements = await Promise.all(
      performanceData.map(async (driver) => {
        const achievements = await db
          .select({
            id: driverAchievements.id,
            name: driverAchievements.name,
            badgeIcon: driverAchievements.badgeIcon,
            earnedAt: driverEarnedAchievements.earnedAt,
          })
          .from(driverEarnedAchievements)
          .innerJoin(
            driverAchievements,
            eq(driverEarnedAchievements.achievementId, driverAchievements.id)
          )
          .where(eq(driverEarnedAchievements.chauffeurId, driver.id));

        return {
          ...driver,
          ranking: performanceData.findIndex((d) => d.id === driver.id) + 1,
          achievements,
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
