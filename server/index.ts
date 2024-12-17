import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import driverRoutes from "./routes/driver";
import { setupVite, serveStatic } from "./vite";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { setupWebSocket } from "./websocket";
import { setupAuth } from "./auth";

// Extend express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: Express.User;
      isAuthenticated(): boolean;
    }
  }
}

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

async function startServer() {
  try {
    // Database connection
    const { testDatabaseConnection } = await import('./db');
    const connected = await testDatabaseConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }
    console.log('Database connection successful');

    // Create server instance
    const server = createServer(app);

    // Core setup
    setupAuth(app);
    registerRoutes(app);
    app.use('/api/driver', driverRoutes);

    // Error handling
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Server Error:', err);
      res.status(500).json({ error: err.message });
    });

    // Setup development or production mode
    if (process.env.NODE_ENV === "development") {
      try {
        await setupVite(app, server);
        console.log('Vite middleware setup completed');
      } catch (error) {
        console.error('Error setting up Vite:', error);
        throw error;
      }
    } else {
      // Serve static files from the dist/public directory
      app.use(express.static(path.join(__dirname, '../dist/public')));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(__dirname, '../dist/public/index.html'));
      });
    }

    // Setup WebSocket
    const wss = new WebSocketServer({ server, path: "/ws" });
    setupWebSocket(wss);

    // Start server
    const port = Number(process.env.PORT) || 5000;
    server.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });

    return server;
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);