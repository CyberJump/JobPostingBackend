import redisService from "../redis/redis.service.js";
import logger from "../../shared/logging/logger.js";

export const cacheService = {
    async get(key) {
        try {
            const raw = await redisService.get(key);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (err) {
            logger.warn({ err: err.message, key }, "Cache hit deserialization or fetch error; failing open to null");
            return null;
        }
    },

    async set(key, value, ttlSeconds = 300) {
        try {
            if (value === undefined || value === null) return false;
            const serialized = JSON.stringify(value);
            return await redisService.set(key, serialized, ttlSeconds);
        } catch (err) {
            logger.warn({ err: err.message, key }, "Cache set serialization or write error; failing open");
            return false;
        }
    },

    async delete(key) {
        try {
            return await redisService.delete(key);
        } catch (err) {
            logger.warn({ err: err.message, key }, "Cache delete error");
            return false;
        }
    },

    async deleteByPattern(pattern) {
        try {
            return await redisService.deleteByPattern(pattern);
        } catch (err) {
            logger.warn({ err: err.message, pattern }, "Cache deleteByPattern error");
            return 0;
        }
    },
};

export default cacheService;
