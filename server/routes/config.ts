import { Router } from 'express';

const router = Router();

router.get('/config', (req, res) => {
  // Only expose necessary environment variables
  res.json({
    TOMTOM_API_KEY: process.env.TOMTOM_API_KEY || '',
  });
});

export default router;
