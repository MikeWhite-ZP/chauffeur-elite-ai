import { Router } from "express";
import { db } from "../db";
import { bookings, chauffeurs, users, driverPerformanceMetrics, driverAchievements, driverEarnedAchievements, driverWellnessMetrics } from "@db/schema";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

const router = Router();

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 5000, 10000];
async function checkAndAwardAchievements(chauffeurId: number) {
  const [metrics] = await db
    .select()
    .from(driverPerformanceMetrics)
    .where(eq(driverPerformanceMetrics.chauffeurId, chauffeurId))
    .limit(1);

  if (!metrics) return;

  const achievements = await db
    .select()
    .from(driverAchievements)
    .where(eq(driverAchievements.isActive, true));

  for (const achievement of achievements) {
    const criteria = achievement.criteria as any;
    let earned = false;

    switch (criteria.type) {
      case 'trips':
        earned = metrics.completedTrips >= criteria.count;
        break;
      case 'rating':
        earned = Number(metrics.averageRating) >= criteria.value;
        break;
      case 'ontime':
        earned = Number(metrics.onTimePercentage) >= criteria.rate && 
                metrics.completedTrips >= criteria.count;
        break;
      case 'streak':
        earned = metrics.currentStreak >= criteria.days;
        break;
    }

    if (earned) {
      // Check if already earned
      const [existingAward] = await db
        .select()
        .from(driverEarnedAchievements)
        .where(
          and(
            eq(driverEarnedAchievements.chauffeurId, chauffeurId),
            eq(driverEarnedAchievements.achievementId, achievement.id)
          )
        )
        .limit(1);

      if (!existingAward) {
        // Award the achievement
        await db.insert(driverEarnedAchievements).values({
          chauffeurId,
          achievementId: achievement.id,
          pointsAwarded: achievement.points,
          earnedAt: new Date()
        });

        // Update total points
        await db
          .update(driverPerformanceMetrics)
          .set({ 
            totalPoints: sql`${driverPerformanceMetrics.totalPoints} + ${achievement.points}`,
            lastUpdated: new Date()
          })
          .where(eq(driverPerformanceMetrics.chauffeurId, chauffeurId));
      }
    }
  }
}

async function getDriverPerformanceHistory(chauffeurId: number): Promise<PerformanceTrend> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Fetch completed trips in the last 30 days
  const tripsHistory = await db
    .select({
      count: sql<number>`count(*)::int`,
      date: sql<string>`date_trunc('day', ${bookings.pickupDate})::text`,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.chauffeurId, chauffeurId),
        gte(bookings.pickupDate, thirtyDaysAgo),
        eq(bookings.status, 'completed')
      )
    )
    .groupBy(sql`date_trunc('day', ${bookings.pickupDate})`)
    .orderBy(sql`date_trunc('day', ${bookings.pickupDate})`);

  // Format the data for the frontend
  const trips = tripsHistory.map(day => ({
    value: day.count,
    timestamp: day.date,
  }));

  // For demo purposes, generate some sample data for other metrics
  // In production, this would come from actual historical data
  const generateTrendData = (baseValue: number, variance: number) => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        value: baseValue + (Math.random() * variance * 2 - variance),
        timestamp: date.toISOString().split('T')[0],
      };
    });
  };

  return {
    trips,
    ratings: generateTrendData(4.5, 0.5),
    onTime: generateTrendData(95, 5),
    points: generateTrendData(100, 20),
  };
}

// GET /api/driver/stats
interface AchievementProgress {
  achievement: {
    id: number;
    name: string;
    description: string;
    badgeIcon: string;
    points: number;
  };
  progress: number;
  required: number;
}

router.get("/stats", async (req, res) => {
  try {
    if (!req.isAuthenticated() || req.user?.role !== 'driver') {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [chauffeur] = await db
      .select()
      .from(chauffeurs)
      .where(eq(chauffeurs.userId, req.user.id))
      .limit(1);

    if (!chauffeur) {
      return res.status(404).json({ error: "Driver not found" });
    }

    // Get performance metrics
    console.log('Fetching performance metrics for chauffeur:', chauffeur.id);
    const metricsResult = await db
      .select()
      .from(driverPerformanceMetrics)
      .where(eq(driverPerformanceMetrics.chauffeurId, chauffeur.id))
      .limit(1);

    console.log('Metrics result:', metricsResult);

    if (!metricsResult.length) {
      // If no metrics exist, create default metrics
      console.log('Creating default metrics for new driver');
      const [newMetrics] = await db
        .insert(driverPerformanceMetrics)
        .values({
          chauffeurId: chauffeur.id,
          totalTrips: 0,
          completedTrips: 0,
          cancelledTrips: 0,
          totalRatings: 0,
          averageRating: '0.0',
          onTimePercentage: '100.0',
          totalPoints: 0,
          currentStreak: 0,
          bestStreak: 0,
          lastUpdated: new Date(),
        })
        .returning();
      
      console.log('Created default metrics:', newMetrics);
      var metrics = newMetrics;
    } else {
      var metrics = metricsResult[0];
    }

    // Get most recent achievement
    console.log('Fetching recent achievement for chauffeur:', chauffeur.id);
    let recentAchievement = null;
    try {
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
        .where(eq(driverEarnedAchievements.chauffeurId, chauffeur.id))
        .orderBy(desc(driverEarnedAchievements.earnedAt))
        .limit(1);

      console.log('Recent achievements query result:', achievements);
      if (achievements.length > 0) {
        recentAchievement = achievements[0];
      }
    } catch (error) {
      console.error('Error fetching recent achievement:', error);
      // Continue without recent achievement
    }

    // Calculate level and next threshold
    const [level, nextLevelPoints] = calculateLevel(metrics.totalPoints || 0);

    // Get today's assignments count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('Fetching today\'s assignments:', { 
      chauffeurId: chauffeur.id, 
      today: today.toISOString(), 
      tomorrow: tomorrow.toISOString() 
    });

    const todayAssignmentsResult = await db
      .select({
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.chauffeurId, chauffeur.id),
          gte(bookings.pickupDate, today),
          lt(bookings.pickupDate, tomorrow)
        )
      );

    console.log('Today\'s assignments result:', todayAssignmentsResult);
    const todayAssignments = todayAssignmentsResult[0]?.count || 0;
    console.log('Parsed assignments count:', todayAssignments);

    // Check and award any new achievements
    await checkAndAwardAchievements(chauffeur.id);

    // Get upcoming achievements and progress
    const upcomingAchievements: AchievementProgress[] = [];
    const allAchievements = await db
      .select()
      .from(driverAchievements)
      .where(eq(driverAchievements.isActive, true));

    for (const achievement of allAchievements) {
      const criteria = achievement.criteria as any;
      let progress = 0;
      let required = 0;

      switch (criteria.type) {
        case 'trips':
          progress = metrics.completedTrips;
          required = criteria.count;
          break;
        case 'rating':
          progress = Number(metrics.averageRating) * 20; // Convert to percentage
          required = criteria.value * 20;
          break;
        case 'ontime':
          progress = Number(metrics.onTimePercentage);
          required = criteria.rate;
          break;
        case 'streak':
          progress = metrics.currentStreak;
          required = criteria.days;
          break;
      }

      // Only include unearned achievements
      const [earned] = await db
        .select()
        .from(driverEarnedAchievements)
        .where(
          and(
            eq(driverEarnedAchievements.chauffeurId, chauffeur.id),
            eq(driverEarnedAchievements.achievementId, achievement.id)
          )
        )
        .limit(1);

      if (!earned) {
        upcomingAchievements.push({
          achievement: {
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            badgeIcon: achievement.badgeIcon,
            points: achievement.points
          },
          progress,
          required
        });
      }
    }

    // Fetch performance history
    console.log('Fetching performance history for chauffeur:', chauffeur.id);
    const performanceHistory = await getDriverPerformanceHistory(chauffeur.id);
    console.log('Performance history fetched:', performanceHistory);

    res.json({
      upcomingAchievements,
      todayAssignments,
      rating: metrics.averageRating ? Number(metrics.averageRating) : 0,
      completedTrips: metrics.completedTrips ?? 0,
      onTimePercentage: metrics.onTimePercentage ? Number(metrics.onTimePercentage) : 100,
      currentStatus: chauffeur.isAvailable ? 'available' : 'busy',
      currentStreak: metrics.currentStreak ?? 0,
      bestStreak: metrics.bestStreak ?? 0,
      totalPoints: metrics.totalPoints ?? 0,
      level,
      nextLevelPoints,
      recentAchievement,
      performanceTrends: performanceHistory,
    });
  } catch (error) {
    console.error("Error fetching driver stats:", error);
    res.status(500).json({ error: "Failed to fetch driver stats" });
  }
});

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
          .where(eq(driverEarnedAchievements.chauffeurId, driver.id as number));

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

// GET /api/driver/achievements
router.get("/achievements", async (req, res) => {
  try {
    if (!req.isAuthenticated() || req.user?.role !== 'driver') {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [chauffeur] = await db
      .select()
      .from(chauffeurs)
      .where(eq(chauffeurs.userId, req.user.id))
      .limit(1);

    if (!chauffeur) {
      return res.status(404).json({ error: "Driver not found" });
    }

    // Fetch earned achievements for the driver
    const earnedAchievements = await db
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
      .where(eq(driverEarnedAchievements.chauffeurId, chauffeur.id))
      .orderBy(desc(driverEarnedAchievements.earnedAt))
      .limit(6);

    // Get performance metrics to calculate totals
    const [metrics] = await db
      .select()
      .from(driverPerformanceMetrics)
      .where(eq(driverPerformanceMetrics.chauffeurId, chauffeur.id))
      .limit(1);

    const achievementStats = {
      totalAchievements: earnedAchievements.length,
      totalPoints: metrics?.totalPoints || 0,
      currentStreak: metrics?.currentStreak || 0,
      bestStreak: metrics?.bestStreak || 0,
      recentAchievements: earnedAchievements,
    };

    res.json(achievementStats);
  } catch (error) {
    console.error("Error fetching driver achievements:", error);
    res.status(500).json({ error: "Failed to fetch achievements" });
  }
});

export default router;

interface Achievement {
  id: number;
  name: string;
  description: string;
  badgeIcon: string;
  earnedAt: string;
  points: number;
}

interface MetricHistory {
  value: number;
  timestamp: string;
}

interface PerformanceTrend {
  ratings: MetricHistory[];
  trips: MetricHistory[];
  onTime: MetricHistory[];
  points: MetricHistory[];
}
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

// GET /api/driver/wellness
router.get("/wellness", async (req, res) => {
  try {
    if (!req.isAuthenticated() || req.user?.role !== 'driver') {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [chauffeur] = await db
      .select()
      .from(chauffeurs)
      .where(eq(chauffeurs.userId, req.user.id))
      .limit(1);

    if (!chauffeur) {
      return res.status(404).json({ error: "Driver not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's wellness metrics
    const [metrics] = await db
      .select()
      .from(driverWellnessMetrics)
      .where(
        and(
          eq(driverWellnessMetrics.chauffeurId, chauffeur.id),
          eq(sql`date(${driverWellnessMetrics.createdAt})`, sql`current_date`)
        )
      )
      .limit(1);

    if (!metrics) {
      // Return default metrics if none exist for today
      return res.json({
        hoursWorkedToday: 0,
        hoursWorkedWeek: 0,
        lastBreakTime: null,
        breaksTaken: 0,
        restHoursLast24h: 8, // Assume 8 hours rest by default
        routeComplexityScore: 0,
        trafficStressScore: 0,
        wellnessScore: 100, // Start with perfect score
      });
    }

    res.json({
      hoursWorkedToday: Number(metrics.hoursWorkedToday),
      hoursWorkedWeek: Number(metrics.hoursWorkedWeek),
      lastBreakTime: metrics.lastBreakTime?.toISOString() || null,
      breaksTaken: metrics.breaksTaken,
      restHoursLast24h: Number(metrics.restHoursLast24h),
      routeComplexityScore: Number(metrics.routeComplexityScore),
      trafficStressScore: Number(metrics.trafficStressScore),
      wellnessScore: Number(metrics.wellnessScore),
    });
  } catch (error) {
    console.error("Error fetching driver wellness metrics:", error);
    res.status(500).json({ error: "Failed to fetch wellness metrics" });
  }
});