import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app=express();

app.use(cors({
    origin: function (origin, callback) {
        // Allows any origin while keeping credentials support
        // This is necessary because wildcard '*' is not allowed when credentials: true
        callback(null, true);
    },
    credentials: true,
}));

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

// Import routes
import userRoutes from "./routes/user.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import companyRoutes from "./routes/company.routes.js";
import companyInviteRoutes from "./routes/companyinvite.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import studentRoutes from "./routes/student.routes.js";
import verificationRoutes from "./routes/verification.routes.js";

// Register routes

// Health check route
app.get("/api/v1", (req, res) => {
    res.status(200).json({
        success: true,
        message: "BusinessClinic API is running",
        version: "1.0.0",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "healthy",
        message: "BusinessClinic API is running",
        version: "1.0.0",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.use("/api/v1/users",userRoutes);
app.use("/api/v1/jobs",jobRoutes);
app.use("/api/v1/applications",applicationRoutes);
app.use("/api/v1/companies",companyRoutes);
app.use("/api/v1/invites",companyInviteRoutes);
app.use("/api/v1/admin",adminRoutes);
app.use("/api/v1/students",studentRoutes);
app.use("/api/v1/verifications",verificationRoutes);

export default app;