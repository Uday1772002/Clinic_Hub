/**
 * ClinicHub — Main Application Entry Point
 *
 * Wires together middleware, routes, and services for the ClinicHub
 * healthcare management API.  Starts an HTTP + Socket.IO server and
 * connects to MongoDB via Mongoose.
 *
 * Environment variables are loaded from `.env` at the project root.
 */

require("dotenv").config();

const path = require("path");
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// ── Config & utilities ───────────────────────────────────────────────
const connectDB = require("./config/database");
const initializeSocket = require("./config/socket");
const setupSwagger = require("./config/swagger");
const logger = require("./utils/logger");

// ── Middleware ────────────────────────────────────────────────────────
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");

// ── Route modules ────────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const patientRoutes = require("./routes/patientRoutes");
const visitReportRoutes = require("./routes/visitReportRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

// ── Express & HTTP server ────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ── Security headers via Helmet ──────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // Vite injects inline scripts/styles; CSP would block them
    crossOriginEmbedderPolicy: false,
  }),
);

// ── CORS ─────────────────────────────────────────────────────────────
// Allow the React dev-server (port 3000) to talk to the API.
// In production, lock this down to your actual domain.
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",")
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, same-origin in prod)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // required so cookies are sent cross-origin
  }),
);

// ── Body parsing ─────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Cookie parser (reads JWT from httpOnly cookie) ───────────────────
app.use(cookieParser());

// ── HTTP request logging ─────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: { write: (msg) => logger.info(msg.trim()) },
    }),
  );
}

// ── Rate limiting (applied to all /api/* routes) ─────────────────────
app.use("/api", apiLimiter);

// ── Health-check (useful for Docker HEALTHCHECK & load-balancers) ────
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ClinicHub API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── API routes ───────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/visit-reports", visitReportRoutes);
app.use("/api/analytics", analyticsRoutes);

// ── Swagger docs (served at /api-docs) ───────────────────────────────
setupSwagger(app);

// ── Serve React frontend in production ────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "..", "client", "dist");
  const fs = require("fs");

  if (!fs.existsSync(clientBuildPath)) {
    logger.error(
      `[STATIC] Client build not found at: ${clientBuildPath}. ` +
        "Run 'cd client && npm run build' inside the container.",
    );
  } else {
    logger.info(`[STATIC] Serving frontend from: ${clientBuildPath}`);
    // List all files in dist so we can verify in deploy logs
    const listFiles = (dir, prefix = "") => {
      fs.readdirSync(dir).forEach((f) => {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) listFiles(full, prefix + f + "/");
        else logger.info(`[STATIC]   ${prefix}${f}`);
      });
    };
    listFiles(clientBuildPath);
  }

  app.use(express.static(clientBuildPath));

  // All unmatched routes serve the React app (SPA client-side routing)
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
} else {
  // ── Welcome route (dev only) ─────────────────────────────────────
  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: "Welcome to ClinicHub API",
      version: "1.0.0",
      documentation: "/api-docs",
    });
  });

  // ── 404 catch-all ──────────────────────────────────────────────────
  app.use("*", (_req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });
}

// ── Global error handler (must be the *last* middleware) ─────────────
app.use(errorHandler);

// ── Socket.IO (real-time appointment & notification events) ──────────
const io = initializeSocket(server);
app.set("io", io);

// ── Start server ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 6000;

// Start HTTP server immediately so the React app is always served.
// MongoDB connection happens after — if it fails, API routes return 503
// but the frontend still loads (users see login page, not a white screen).
server.listen(PORT, () => {
  logger.info("=================================");
  logger.info(`Server running on port ${PORT}`);
  logger.info(`API Docs: http://localhost:${PORT}/api-docs`);
  logger.info(`ClinicHub API v1.0.0`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info("=================================");
});

connectDB()
  .then(() => {
    logger.info("MongoDB connected — all systems operational");
  })
  .catch((error) => {
    logger.error("MongoDB connection failed:", error.message);
    logger.error("API routes will return 503 until the database is reachable.");
    // Do NOT exit — keep serving the frontend so the issue is visible
  });

// ── Graceful shutdown helpers ────────────────────────────────────────
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

module.exports = app;
