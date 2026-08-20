import Redis from "ioredis";
import config from "../../config/env.js";
import logger from "../../shared/logging/logger.js";

let redisClient = null;
let isReady = false;

export const getRedisClient = () => {
    if (!config.redis.enabled) {
        return null;
    }

    if (redisClient) {
        return redisClient;
    }

    try {
        redisClient = new Redis(config.redis.url, {
            keyPrefix: `${config.redis.keyPrefix}:`,
            connectTimeout: Number(config.redis.connectTimeoutMs),
            lazyConnect: true,
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                const delay = Math.min(times * 100, 3000);
                logger.warn({ times, delayMs: delay }, "Redis connection retrying...");
                return delay;
            },
        });

        redisClient.on("connect", () => {
            isReady = true;
            console.log("Redis TCP connection established");
            logger.info({ prefix: config.redis.keyPrefix }, "Redis client connected successfully");
        });

        redisClient.on("ready", () => {
            isReady = true;
            console.log("Redis client ready");
        });

        redisClient.on("error", (err) => {
            isReady = false;
            console.error("Redis infrastructure connection error:", err);
            logger.error({ err: err.message }, "Redis infrastructure connection error");
        });

        redisClient.on("close", () => {
            isReady = false;
            console.log("Redis connection closed");
            logger.warn("Redis connection closed");
        });

        redisClient.on("reconnecting", () => {
            console.log("Redis reconnecting...");
            logger.warn("Redis reconnecting...");
        });

        // Trigger connection asynchronously
        redisClient.connect().catch((err) => {
            isReady = false;
            logger.warn({ err: err.message }, "Initial Redis connection attempt un-successful");
        });

        return redisClient;
    } catch (err) {
        logger.error({ err }, "Failed to initialize Redis client instance");
        redisClient = null;
        isReady = false;
        return null;
    }
};

export const isRedisReady = () => {
    return isReady && redisClient !== null && redisClient.status === "ready";
};

export const closeRedis = async () => {
    if (redisClient) {
        try {
            logger.info("Closing Redis connection gracefully...");
            await redisClient.quit();
        } catch (err) {
            logger.error({ err }, "Error during Redis connection shutdown");
        } finally {
            redisClient = null;
            isReady = false;
        }
    }
};

export const redisClientManager = {
    getRedisClient,
    isRedisReady,
    closeRedis,
};

export default redisClientManager;
