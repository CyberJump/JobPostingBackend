import crypto from "crypto";

export const normalizeIdentifier = (identifier) => {
    if (!identifier) return "anonymous";
    const cleaned = String(identifier).trim().toLowerCase();
    // If identifier looks like an email address, return SHA-256 hash for privacy
    if (cleaned.includes("@")) {
        return crypto.createHash("sha256").update(cleaned).digest("hex").substring(0, 16);
    }
    return cleaned;
};

export const redisKeys = {
    otp: (purpose, identifier) => `otp:${purpose}:${normalizeIdentifier(identifier)}`,
    otpAttempts: (purpose, identifier) => `otp:attempts:${purpose}:${normalizeIdentifier(identifier)}`,
    otpCooldown: (purpose, identifier) => `otp:cooldown:${purpose}:${normalizeIdentifier(identifier)}`,
    otpLockout: (purpose, identifier) => `otp:lockout:${purpose}:${normalizeIdentifier(identifier)}`,
    rateLimit: (tier, identity, windowId) => `ratelimit:${tier}:${normalizeIdentifier(identity)}:${windowId}`,
    cacheJob: (jobId) => `cache:job:${jobId}`,
    cacheJobsList: (queryHash) => `cache:jobs:list:${queryHash}`,
    cacheCompany: (companyId) => `cache:company:${companyId}`,
    idempotency: (scope, key) => `idempotency:${scope}:${key}`,
};

export default redisKeys;
