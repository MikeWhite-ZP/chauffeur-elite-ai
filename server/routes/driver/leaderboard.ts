import { Router } from 'express';
import { db } from '@db';
import { driverPerformanceMetrics, chauffeurs, users } from '@db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/leaderboard', async (req, res) => {
  try {
    // Join performance metrics with chauffeur and user info
    const leaderboard = await db
      .select({
        chauffeurId: chauffeurs.id,
        fullName: users.fullName,
        totalPoints: driverPerformanceMetrics.totalPoints,
        totalTrips: driverPerformanceMetrics.totalTrips,
        completedTrips: driverPerformanceMetrics.completedTrips,
        averageRating: driverPerformanceMetrics.averageRating,
        currentStreak: driverPerformanceMetrics.currentStreak,
        bestStreak: driverPerformanceMetrics.bestStreak,
      })
      .from(driverPerformanceMetrics)
      .innerJoin(chauffeurs, eq(driverPerformanceMetrics.chauffeurId, chauffeurs.id))
      .innerJoin(users, eq(chauffeurs.userId, users.id))
      .orderBy(driverPerformanceMetrics.totalPoints);

    // Add rank to each driver
    const rankedLeaderboard = leaderboard.map((driver, index) => ({
      ...driver,
      rank: index + 1,
    }));

    res.json(rankedLeaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

export default router;
