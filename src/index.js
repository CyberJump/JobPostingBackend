import mongoose from "mongoose";
import config from "./config/env.js";
import connectDB from "./db/index.js";
import app from "./app.js";
import logger from "./shared/logging/logger.js";
import { getRedisClient, closeRedis } from "./infrastructure/redis/redis.client.js";

let server;

const startServer = async () => {
    try {
        await connectDB();

        // Initialize Redis infrastructure connection
        if (config.redis.enabled) {
            getRedisClient();
        }

        server = app.listen(config.port, () => {
            logger.info({ port: config.port, env: config.env }, `Server running on port ${config.port}`);
        });
    } catch (err) {
        logger.error({ err }, "Error starting application");
        process.exit(1);
    }
};

const gracefulShutdown = async (signal) => {
    logger.info({ signal }, `Received ${signal}. Initiating graceful shutdown...`);

    // Force exit timeout fallback after 10 seconds
    const timeout = setTimeout(() => {
        logger.error("Graceful shutdown timeout exceeded (10s). Forcing process exit.");
        process.exit(1);
    }, 10000);

    try {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
            logger.info("HTTP server closed to new connections");
        }

        await closeRedis();
        await mongoose.connection.close();
        logger.info("MongoDB database connection closed");

        clearTimeout(timeout);
        logger.info("Graceful shutdown completed cleanly");
        process.exit(0);
    } catch (err) {
        logger.error({ err }, "Error during graceful shutdown");
        clearTimeout(timeout);
        process.exit(1);
    }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startServer();