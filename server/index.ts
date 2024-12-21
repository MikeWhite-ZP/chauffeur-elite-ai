import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import driverRoutes from "./routes/driver";
import configRoutes from "./routes/config";
import { setupVite, serveStatic } from "./vite";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { setupWebSocket } from "./websocket";
import { setupAuth } from "./auth";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Configuration routes
app.use('/api', configRoutes);

// Simple request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

async function startServer() {
  try {
    // Database connection
    console.log('Initializing database connection...');
    const { testDatabaseConnection } = await import('./db');
    const connected = await testDatabaseConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }
    console.log('Database connection successful');

    // Core setup
    console.log('Setting up core server components...');
    setupAuth(app);
    registerRoutes(app);
    app.use('/api/driver', driverRoutes);

    // Create HTTP server
    const server = createServer(app);

    // Setup development or production mode
    if (process.env.NODE_ENV === "development") {
      console.log('Setting up development environment...');
      try {
        await setupVite(app, server);
        console.log('Vite middleware setup completed');
      } catch (error) {
        console.error('Error setting up Vite:', error);
        throw error;
      }
    } else {
      console.log('Setting up production environment...');
      const publicPath = path.resolve(__dirname, '../dist/public');
      app.use(express.static(publicPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(publicPath, 'index.html'));
      });
    }

    // Error handling middleware (should be after routes)
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Server Error:', err);
      res.status(500).json({ error: err.message });
    });

    // Setup WebSocket
    console.log('Setting up WebSocket server...');
    const wss = new WebSocketServer({ server, path: "/ws" });
    setupWebSocket(wss);

    // Start server
    const port = Number(process.env.PORT) || 5000;
    await new Promise<void>((resolve) => {
      server.listen(port, '0.0.0.0', () => {
        console.log(`Server running on port ${port}`);
        resolve();
      });
    });

    return server;
  } catch (error) {
    console.error('Server startup failed:', error);
    throw error; // Let the error propagate instead of exiting
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

startServer().catch(console.error);