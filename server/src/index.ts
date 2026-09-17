import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import activityRoutes from "./routes/activity.js";
import telemetryRoutes from "./routes/telemetry.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? "your-production-url.com"
      : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs for auth routes
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ZynVault API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Auth routes with stricter rate limiting
app.use("/api/auth", authLimiter, authRoutes);

// Activity & Telemetry routes
app.use("/api/activity", activityRoutes);
app.use("/api/telemetry", telemetryRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);

    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 ZynVault API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || "development"}
🔗 URL: http://localhost:${PORT}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;