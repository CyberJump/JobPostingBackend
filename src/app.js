import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./config/env.js";
import { requestContextMiddleware } from "./middlewares/requestContext.middleware.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";

// Import routes
import userRoutes from "./routes/user.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import companyRoutes from "./routes/company.routes.js";
import companyInviteRoutes from "./routes/companyinvite.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import studentRoutes from "./routes/student.routes.js";
import verificationRoutes from "./routes/verification.routes.js";

const app = express();

// Request Context & ID Middleware
app.use(requestContextMiddleware);

// Restricted CORS Configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman, health probes)
        if (!origin) return callback(null, true);
        if (config.cors.allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("CORS policy violation: Origin not allowed"), false);
    },
    credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Health check routes
app.get("/api/v1", (req, res) => {
    res.status(200).json({
        success: true,
        message: "BusinessClinic API is running",
        version: "1.0.0",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        requestId: req.id
    });
});

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "healthy",
        message: "BusinessClinic API is running",
        version: "1.0.0",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        requestId: req.id
    });
});

// Liveness probe (Process check)
app.get("/api/v1/health/live", (req, res) => {
    res.status(200).json({
        success: true,
        status: "alive",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        requestId: req.id
    });
});

// Readiness probe (Database & Infrastructure check)
app.get("/api/v1/health/ready", async (req, res) => {
    const mongoose = await import("mongoose");
    const { checkRedisHealth } = await import("./infrastructure/redis/redis.health.js");

    const isMongoReady = mongoose.default.connection.readyState === 1;
    const redisHealth = await checkRedisHealth();

    const isRedisCheckPassed = !config.redis.enabled || redisHealth.status === "healthy" || redisHealth.status === "disabled";
    const isReady = isMongoReady && isRedisCheckPassed;

    const statusCode = isReady ? 200 : 530;

    res.status(statusCode).json({
        success: isReady,
        status: isReady ? "ready" : "not_ready",
        services: {
            database: isMongoReady ? "connected" : "disconnected",
            redis: redisHealth,
        },
        timestamp: new Date().toISOString(),
        requestId: req.id
    });
});

import otpRoutes from "./modules/auth/presentation/routes/otp.routes.js";
import emailVerificationRoutes from "./modules/auth/presentation/routes/emailVerification.routes.js";

// Register feature routes
app.use("/api/v1/auth", otpRoutes);
app.use("/api/v1/auth/email-verification", emailVerificationRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/invites", companyInviteRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/verifications", verificationRoutes);

// Global Error Handler Middleware
app.use(globalErrorHandler);

export default app;