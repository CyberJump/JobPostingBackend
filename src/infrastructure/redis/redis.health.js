import config from "../../config/env.js";
import { getRedisClient, isRedisReady } from "./redis.client.js";

export const checkRedisHealth = async () => {
    if (!config.redis.enabled) {
        return {
            status: "disabled",
            pingMs: null,
            error: null,
        };
    }

    if (!isRedisReady()) {
        return {
            status: "unhealthy",
            pingMs: null,
            error: "Redis client is not connected or ready",
        };
    }

    try {
        const client = getRedisClient();
        const start = Date.now();
        const pong = await client.ping();
        const pingMs = Date.now() - start;

        if (pong === "PONG") {
            return {
                status: "healthy",
                pingMs,
                error: null,
            };
        } else {
            return {
                status: "unhealthy",
                pingMs,
                error: `Unexpected ping response: ${pong}`,
            };
        }
    } catch (err) {
        return {
            status: "unhealthy",
            pingMs: null,
            error: err.message,
        };
    }
};

export default checkRedisHealth;
