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
  
  const server = createServer(app);
  
  // Set up WebSocket server with proper error handling
  const wss = new WebSocketServer({ 
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

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  }).on('error', (error) => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
})();
