import redisService from "../redis/redis.service.js";
import redisKeys from "../redis/redis.keys.js";
import { redisClientManager } from "../redis/redis.client.js";
import config from "../../config/env.js";
import { AppError, RateLimitError } from "../../shared/errors/AppError.js";
import logger from "../../shared/logging/logger.js";

export const fixedWindowRateLimiter = (tier, options = {}) => {
    return async (req, res, next) => {
        if (!config.redis.enabled) {
            return next();
        }

        const limit = options.limit || 10;
        const windowSeconds = options.windowSeconds || 60;

        const identity = (req.user && req.user._id) ? req.user._id.toString() : (req.ip || req.headers["x-forwarded-for"] || "127.0.0.1");

        const windowId = Math.floor(Date.now() / (windowSeconds * 1000));
        const key = redisKeys.rateLimit(tier, identity, windowId);

        if (!redisClientManager.isRedisReady()) {
            logger.warn({ tier, identity }, "Redis unavailable during rate limit check; failing closed for security tier");
            return next(new AppError(503, "Infrastructure error: Rate limit security service temporarily unavailable", "INFRASTRUCTURE_ERROR"));
        }

        try {
            const count = await redisService.increment(key);
            if (count === 1) {
                await redisService.expire(key, windowSeconds);
            }

            const remaining = Math.max(0, limit - count);
            const resetTimeSeconds = (windowId + 1) * windowSeconds;
            const retryAfterSeconds = Math.max(1, Math.ceil(resetTimeSeconds - (Date.now() / 1000)));

            res.setHeader("X-RateLimit-Limit", limit);
            res.setHeader("X-RateLimit-Remaining", remaining);
            res.setHeader("X-RateLimit-Reset", resetTimeSeconds);

            if (count > limit) {
                res.setHeader("Retry-After", retryAfterSeconds);
                logger.warn({ tier, identity, count, limit }, "Fixed-Window rate limit exceeded");
                return next(new RateLimitError(`Too many requests. Please try again in ${retryAfterSeconds} seconds.`));
            }

            next();
        } catch (err) {
            logger.error({ err: err.message, tier, identity }, "Error executing fixed-window rate limiter");
            return next(new AppError(503, "Infrastructure error during rate limit verification", "INFRASTRUCTURE_ERROR"));
        }
    };
};

export default fixedWindowRateLimiter;
