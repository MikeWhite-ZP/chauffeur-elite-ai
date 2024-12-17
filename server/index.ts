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

function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [express] ${message}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Setup development environment first
  if (app.get("env") === "development") {
    try {
      await setupVite(app);
      console.log('Vite middleware setup completed');
    } catch (error) {
      console.error('Failed to setup Vite middleware:', error);
      process.exit(1);
    }
  } else {
    serveStatic(app);
  }

  // Setup authentication
  try {
    try {
      // Initialize database connection
      console.log('Initializing database connection...');
      const { testDatabaseConnection } = await import('./db');

      // Test database connection with retries
      let connected = false;
      for (let i = 0; i < 3 && !connected; i++) {
        console.log(`Attempting database connection (attempt ${i + 1}/3)...`);
        connected = await testDatabaseConnection();
        if (!connected && i < 2) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
        }
      }

      if (!connected) {
        throw new Error('Failed to connect to database after 3 attempts');
      }

      console.log('Database connection successful');
      console.log('Starting server initialization...');

      // Setup authentication
      console.log('Setting up authentication...');
      setupAuth(app);
      console.log('Authentication setup completed');

      // Register API routes after auth setup
      console.log('Registering API routes...');
      registerRoutes(app);
      // Register driver routes
      app.use('/api/driver', driverRoutes);
      console.log('API routes registered successfully');

      // Add error handling middleware
      app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
        console.error('Server Error:', err);
        res.status(500).json({ error: err.message });
      });
      console.log('Error handling middleware added');
    } catch (error) {
      console.error('Critical error during server initialization:', error);
      process.exit(1);
    }

    const server = createServer(app);

    // Set up WebSocket server with proper error handling
    let wss: WebSocketServer | null = null;

    const setupWss = () => {
      if (wss) {
        // Clean up existing connections
        wss.clients.forEach(client => {
          try {
            client.close();
          } catch (e) {
            console.error('Error closing WebSocket client:', e);
          }
        });
        wss.close();
      }

      wss = new WebSocketServer({
        server,
        path: "/ws",
        clientTracking: true
      });

      // Initialize WebSocket handling
      setupWebSocket(wss);

      // Log WebSocket server status
      wss.on('listening', () => {
        log('WebSocket server is ready');
      });

      wss.on('error', (error) => {
        console.error('WebSocket server error:', error);
      });

      return wss;
    };

    setupWss();

    interface AppError extends Error {
      status?: number;
      statusCode?: number;
    }

    app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error(`[Error] ${status}: ${message}`);

      // Send error response without throwing
      res.status(status).json({
        status: 'error',
        message: app.get('env') === 'development' ? message : 'Internal Server Error'
      });
    });

    // Initialize server with proper error handling
    const startServer = () => {
      return new Promise((resolve, reject) => {
        try {
          const PORT = 5000;
          server.listen(PORT, '0.0.0.0', () => {
            log(`Server is running on port ${PORT}`);
            resolve(PORT);
          });

          server.on('error', (error: NodeJS.ErrnoException) => {
            console.error('Server error:', error);
            if (error.code === 'EADDRINUSE') {
              log('Port 5000 is in use, cannot start server');
              reject(error);
            } else {
              log(`Server error: ${error.message}`);
              reject(error);
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    };

    // Start server with proper error handling
    try {
      await startServer();
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      log('SIGTERM received. Shutting down gracefully...');
      if (wss) {
        wss.close(() => {
          server.close(() => {
            process.exit(0);
          });
        });
      } else {
        server.close(() => {
          process.exit(0);
        });
      }
    });
  })();
})();