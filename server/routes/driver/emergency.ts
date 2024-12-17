import { Router } from 'express';
import { db } from '../../db';
import { emergencyIncidents, chauffeurs } from '@db/schema';
import { eq } from 'drizzle-orm';
import { WebSocket as WS } from 'ws';

const router = Router();

// Store admin WebSocket connections
const adminConnections = new Set<WS>();

export function addAdminConnection(ws: WS) {
  adminConnections.add(ws);
  ws.on('close', () => {
    adminConnections.delete(ws);
  });
}

// POST /api/driver/emergency
router.post('/emergency', async (req, res) => {
  const { chauffeurId, bookingId, latitude, longitude } = req.body;

  try {
    // Validate chauffeur exists
    const [chauffeur] = await db
      .select()
      .from(chauffeurs)
      .where(eq(chauffeurs.id, chauffeurId))
      .limit(1);

    if (!chauffeur) {
      return res.status(404).send('Chauffeur not found');
    }

    // Create emergency incident
    const [incident] = await db
      .insert(emergencyIncidents)
      .values({
        chauffeurId,
        bookingId,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        status: 'active',
      })
      .returning();

    // Notify all connected admin clients
    const notification = JSON.stringify({
      type: 'EMERGENCY_ALERT',
      data: {
        incidentId: incident.id,
        chauffeurId,
        bookingId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      },
    });

    adminConnections.forEach((ws) => {
      if (ws.readyState === WS.OPEN) {
        try {
          ws.send(notification);
        } catch (error) {
          console.error('Failed to send emergency notification:', error);
        }
      }
    });

    res.json({ message: 'Emergency signal received', incident });
  } catch (error) {
    console.error('Emergency endpoint error:', error);
    res.status(500).send('Failed to process emergency signal');
  }
});

export default router;