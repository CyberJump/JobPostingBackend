import { jest } from "@jest/globals";
import fixedWindowRateLimiter from "../../src/infrastructure/rateLimit/fixedWindowRateLimiter.js";
import redisService from "../../src/infrastructure/redis/redis.service.js";
import { redisClientManager } from "../../src/infrastructure/redis/redis.client.js";
import config from "../../src/config/env.js";

describe("Fixed-Window Rate Limiter Middleware", () => {
    let req, res, next;

    beforeEach(() => {
        config.redis.enabled = true;
        req = {
            ip: "127.0.0.1",
            headers: {},
        };
        res = {
            setHeader: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(true);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should allow request and set rate limit headers when count <= limit", async () => {
        jest.spyOn(redisService, "increment").mockResolvedValue(1);
        jest.spyOn(redisService, "expire").mockResolvedValue(true);

        const limiter = fixedWindowRateLimiter("login", { limit: 5, windowSeconds: 60 });
        await limiter(req, res, next);

        expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", 5);
        expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Remaining", 4);
        expect(next).toHaveBeenCalledWith();
    });

    it("should reject request with HTTP 429 when count > limit in current fixed window", async () => {
        jest.spyOn(redisService, "increment").mockResolvedValue(6);

        const limiter = fixedWindowRateLimiter("login", { limit: 5, windowSeconds: 60 });
        await limiter(req, res, next);

        expect(res.setHeader).toHaveBeenCalledWith("Retry-After", expect.any(Number));
        expect(next.mock.calls[0][0]).toBeDefined();
        expect(next.mock.calls[0][0].statusCode).toBe(429);
    });

    it("should set EXPIRE on first increment in window", async () => {
        jest.spyOn(redisService, "increment").mockResolvedValue(1);
        const spyExpire = jest.spyOn(redisService, "expire").mockResolvedValue(true);

        const limiter = fixedWindowRateLimiter("login", { limit: 5, windowSeconds: 60 });
        await limiter(req, res, next);

        expect(spyExpire).toHaveBeenCalled();
    });

    it("should fail closed with HTTP 503 if Redis connection is down", async () => {
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(false);

        const limiter = fixedWindowRateLimiter("login", { limit: 5, windowSeconds: 60 });
        await limiter(req, res, next);

        expect(next.mock.calls[0][0]).toBeDefined();
        expect(next.mock.calls[0][0].statusCode).toBe(503);
    });
});
