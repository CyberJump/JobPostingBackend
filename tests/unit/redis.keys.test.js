import { redisKeys, normalizeIdentifier } from "../../src/infrastructure/redis/redis.keys.js";

describe("Redis Keys Infrastructure", () => {
    it("should normalize email addresses to SHA-256 hash substring for privacy", () => {
        const email = "Test.User@example.com";
        const normalized = normalizeIdentifier(email);
        expect(normalized).not.toContain("example.com");
        expect(normalized.length).toBe(16);
    });

    it("should build deterministic key strings for OTP, RateLimit, Cache, and Idempotency", () => {
        expect(redisKeys.otp("verify", "user123")).toBe("otp:verify:user123");
        expect(redisKeys.otpAttempts("verify", "user123")).toBe("otp:attempts:verify:user123");
        expect(redisKeys.otpCooldown("verify", "user123")).toBe("otp:cooldown:verify:user123");
        expect(redisKeys.otpLockout("verify", "user123")).toBe("otp:lockout:verify:user123");
        expect(redisKeys.rateLimit("login", "127.0.0.1", 1000)).toBe("ratelimit:login:127.0.0.1:1000");
        expect(redisKeys.cacheJob("job123")).toBe("cache:job:job123");
        expect(redisKeys.cacheJobsList("hash123")).toBe("cache:jobs:list:hash123");
        expect(redisKeys.cacheCompany("comp123")).toBe("cache:company:comp123");
        expect(redisKeys.idempotency("submit_app", "key123")).toBe("idempotency:submit_app:key123");
    });
});
