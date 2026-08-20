import { getRedisClient, isRedisReady } from "./redis.client.js";
import logger from "../../shared/logging/logger.js";

export const redisService = {
    async get(key) {
        if (!isRedisReady()) return null;
        try {
            const client = getRedisClient();
            return await client.get(key);
        } catch (err) {
            logger.error({ err: err.message, key }, "Redis GET command failed");
            return null;
        }
    },

    async set(key, value, ttlSeconds = null) {
        if (!isRedisReady()) return false;
        try {
            const client = getRedisClient();
            if (ttlSeconds && ttlSeconds > 0) {
                await client.set(key, value, "EX", ttlSeconds);
            } else {
                await client.set(key, value);
            }
            return true;
        } catch (err) {
            logger.error({ err: err.message, key }, "Redis SET command failed");
            return false;
        }
    },

    async setIfNotExists(key, value, ttlSeconds = null) {
        if (!isRedisReady()) return false;
        try {
            const client = getRedisClient();
            let result;
            if (ttlSeconds && ttlSeconds > 0) {
                result = await client.set(key, value, "EX", ttlSeconds, "NX");
            } else {
                result = await client.set(key, value, "NX");
            }
            return result === "OK";
        } catch (err) {
            logger.error({ err: err.message, key }, "Redis SETNX command failed");
            return false;
        }
    },

    async delete(key) {
        if (!isRedisReady()) return false;
        try {
            const client = getRedisClient();
            const deleted = await client.del(key);
            return deleted > 0;
        } catch (err) {
            logger.error({ err: err.message, key }, "Redis DEL command failed");
            return false;
        }
    },

    async exists(key) {
        if (!isRedisReady()) return false;
        try {
            const client = getRedisClient();
            const result = await client.exists(key);
            return result === 1;
        } catch (err) {
            logger.error({ err: err.message, key }, "Redis EXISTS command failed");
            return false;
        }
    },

    async increment(key) {
        if (!isRedisReady()) return null;
        try {
            const client = getRedisClient();
            return await client.incr(key);
        } catch (err) {
            logger.error({ err: err.message, key }, "Redis INCR command failed");
            return null;
        }
    },

    async expire(key, ttlSeconds) {
        if (!isRedisReady()) return false;
        try {
            const client = getRedisClient();
            const result = await client.expire(key, ttlSeconds);
            return result === 1;
        } catch (err) {
            logger.error({ err: err.message, key }, "Redis EXPIRE command failed");
            return false;
        }
    },

    async getTtl(key) {
        if (!isRedisReady()) return -2;
        try {
            const client = getRedisClient();
            return await client.ttl(key);
        } catch (err) {
            logger.error({ err: err.message, key }, "Redis TTL command failed");
            return -2;
        }
    },

    async deleteByPattern(pattern) {
        if (!isRedisReady()) return 0;
        try {
            const client = getRedisClient();
            let cursor = "0";
            let deletedCount = 0;
            do {
                const res = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
                cursor = res[0];
                const keys = res[1];
                if (keys && keys.length > 0) {
                    // Note: ioredis automatically handles prefixing, so keys returned by scan have prefix omitted or included depending on client setup
                    const unprefixedKeys = keys.map((k) => k.replace(new RegExp(`^${client.options.keyPrefix}`), ""));
                    const count = await client.del(unprefixedKeys);
                    deletedCount += count;
                }
            } while (cursor !== "0");
            return deletedCount;
        } catch (err) {
            logger.error({ err: err.message, pattern }, "Redis SCAN delete by pattern failed");
            return 0;
        }
    },
};

export default redisService;
