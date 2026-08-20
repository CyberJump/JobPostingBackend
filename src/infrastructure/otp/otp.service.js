import crypto from "crypto";
import redisService from "../redis/redis.service.js";
import redisKeys from "../redis/redis.keys.js";
import logger from "../../shared/logging/logger.js";

export const otpService = {
    generateOtp() {
        // Uniform 6-digit numeric OTP generation (100000 through 999999)
        const code = crypto.randomInt(100000, 1000000);
        return String(code);
    },

    hashOtp(otp) {
        return crypto.createHash("sha256").update(String(otp)).digest("hex");
    },

    async checkCooldown(purpose, identifier) {
        const cooldownKey = redisKeys.otpCooldown(purpose, identifier);
        return await redisService.exists(cooldownKey);
    },

    async checkLockout(purpose, identifier) {
        const lockoutKey = redisKeys.otpLockout(purpose, identifier);
        return await redisService.exists(lockoutKey);
    },

    async storeOtp(purpose, identifier, rawOtp, ttlSeconds = 600, cooldownSeconds = 60) {
        const isLockedOut = await this.checkLockout(purpose, identifier);
        if (isLockedOut) {
            return { success: false, reason: "LOCKED_OUT" };
        }

        const isCooldown = await this.checkCooldown(purpose, identifier);
        if (isCooldown) {
            return { success: false, reason: "COOLDOWN" };
        }

        const otpKey = redisKeys.otp(purpose, identifier);
        const cooldownKey = redisKeys.otpCooldown(purpose, identifier);
        const attemptsKey = redisKeys.otpAttempts(purpose, identifier);

        const hashed = this.hashOtp(rawOtp);
        const payload = JSON.stringify({ hash: hashed, createdAt: Date.now() });

        // Store hashed OTP payload & set cooldown flag
        await redisService.set(otpKey, payload, ttlSeconds);
        await redisService.set(cooldownKey, "1", cooldownSeconds);
        await redisService.delete(attemptsKey);

        logger.info({ purpose }, "OTP stored securely (SHA-256 hashed)");
        return { success: true };
    },

    async verifyOtp(purpose, identifier, submittedOtp) {
        const isLockedOut = await this.checkLockout(purpose, identifier);
        if (isLockedOut) {
            return { success: false, reason: "LOCKED_OUT" };
        }

        const otpKey = redisKeys.otp(purpose, identifier);
        const attemptsKey = redisKeys.otpAttempts(purpose, identifier);
        const lockoutKey = redisKeys.otpLockout(purpose, identifier);

        const storedPayload = await redisService.get(otpKey);
        if (!storedPayload) {
            return { success: false, reason: "EXPIRED_OR_INVALID" };
        }

        let parsed;
        try {
            parsed = JSON.parse(storedPayload);
        } catch {
            return { success: false, reason: "EXPIRED_OR_INVALID" };
        }

        const submittedHash = this.hashOtp(submittedOtp);
        if (submittedHash !== parsed.hash) {
            // Increment failed attempt counter
            const attempts = await redisService.increment(attemptsKey);
            if (attempts === 1) {
                await redisService.expire(attemptsKey, 600);
            }

            if (attempts >= 5) {
                // Enforce 15-minute lockout (900 seconds) and delete active OTP
                await redisService.set(lockoutKey, "1", 900);
                await redisService.delete(otpKey);
                await redisService.delete(attemptsKey);
                logger.warn({ purpose }, "OTP 5 failed attempts threshold reached; account locked out for 15 minutes");
                return { success: false, reason: "LOCKED_OUT" };
            }

            return { success: false, reason: "INVALID_OTP", attemptsRemaining: 5 - attempts };
        }

        // Single-use invalidation upon successful verification
        await redisService.delete(otpKey);
        await redisService.delete(attemptsKey);
        await redisService.delete(redisKeys.otpCooldown(purpose, identifier));

        logger.info({ purpose }, "OTP verified successfully and single-use key consumed");
        return { success: true };
    },
};

export default otpService;
