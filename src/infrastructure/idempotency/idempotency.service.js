import redisService from "../redis/redis.service.js";
import redisKeys from "../redis/redis.keys.js";
import logger from "../../shared/logging/logger.js";

export const idempotencyService = {
    async reserve(scope, key, ttlSeconds = 30) {
        if (!key) return { reserved: true, status: "SKIPPED" };
        const fullKey = redisKeys.idempotency(scope, key);
        const payload = JSON.stringify({ status: "PROCESSING", timestamp: Date.now() });

        const success = await redisService.setIfNotExists(fullKey, payload, ttlSeconds);
        if (success) {
            return { reserved: true, status: "PROCESSING" };
        }

        // Key already exists, retrieve state
        const existing = await redisService.get(fullKey);
        if (!existing) {
            return { reserved: false, status: "UNKNOWN" };
        }

        try {
            const parsed = JSON.parse(existing);
            return { reserved: false, status: parsed.status, response: parsed.response };
        } catch {
            return { reserved: false, status: "PROCESSING" };
        }
    },

    async storeResult(scope, key, responseData, ttlSeconds = 86400) {
        if (!key) return false;
        const fullKey = redisKeys.idempotency(scope, key);
        const payload = JSON.stringify({
            status: "COMPLETED",
            response: responseData,
            timestamp: Date.now(),
        });
        return await redisService.set(fullKey, payload, ttlSeconds);
    },

    async release(scope, key) {
        if (!key) return false;
        const fullKey = redisKeys.idempotency(scope, key);
        return await redisService.delete(fullKey);
    },
};

export default idempotencyService;
