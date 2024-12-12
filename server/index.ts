import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
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
  // Setup authentication
  setupAuth(app);
  
  // Register API routes after auth setup
  registerRoutes(app);
  
  // Add error handling middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  });
  
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

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Try to serve on port 5000 first, then try alternative ports
  const tryPort = async (port: number, maxAttempts = 10): Promise<number> => {
    if (maxAttempts <= 0) {
      throw new Error('Maximum port attempts reached');
    }

    try {
      // Close any existing connections first
      await new Promise<void>((resolve) => {
        if (server.listening) {
          server.close(() => resolve());
        } else {
          resolve();
        }
      });

      await new Promise<void>((resolve, reject) => {
        const onError = (err: NodeJS.ErrnoException) => {
          server.off('error', onError);
          server.off('listening', onListening);
          
          if (err.code === 'EADDRINUSE') {
            log(`Port ${port} is in use, trying ${port + 1}`);
            resolve();
          } else {
            reject(err);
          }
        };

        const onListening = () => {
          server.off('error', onError);
          server.off('listening', onListening);
          log(`Server is running on port ${port}`);
          resolve();
        };

        server.once('error', onError);
        server.once('listening', onListening);
        server.listen(port, '0.0.0.0');
      });

      if (!server.listening) {
        return tryPort(port + 1, maxAttempts - 1);
      }

      return port;
    } catch (err) {
      if (err instanceof Error && 'code' in err && err.code === 'EADDRINUSE') {
        return tryPort(port + 1, maxAttempts - 1);
      }
      throw err;
    }
  };

  // Start with port 5000 and try subsequent ports if needed
  tryPort(5000)
    .then(port => {
      log(`Server successfully started on port ${port}`);
      
      // Set up error handlers for the server
      server.on('error', (error: NodeJS.ErrnoException) => {
        console.error('Server error:', error);
        if (error.code === 'EADDRINUSE') {
          log('Address in use, retrying...');
          setTimeout(() => {
            server.close();
            tryPort(port + 1);
          }, 1000);
        }
      });
      
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
    })
    .catch(err => {
      console.error('Failed to start server:', err);
      if (wss) {
        wss.close(() => {
          server.close(() => {
            process.exit(1);
          });
        });
      } else {
        server.close(() => {
          process.exit(1);
        });
      }
    });
})();
