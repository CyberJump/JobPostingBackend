import { jest } from "@jest/globals";
import otpService from "../../src/infrastructure/otp/otp.service.js";
import redisService from "../../src/infrastructure/redis/redis.service.js";

describe("OTP Infrastructure Service", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should generate cryptographically secure 6-digit numeric OTP", () => {
        const code = otpService.generateOtp();
        expect(typeof code).toBe("string");
        expect(code.length).toBe(6);
        const numeric = parseInt(code, 10);
        expect(numeric).toBeGreaterThanOrEqual(100000);
        expect(numeric).toBeLessThan(1000000);
    });

    it("should compute SHA-256 hash of OTP string", () => {
        const hash1 = otpService.hashOtp("123456");
        const hash2 = otpService.hashOtp("123456");
        const hash3 = otpService.hashOtp("654321");

        expect(hash1).toBe(hash2);
        expect(hash1).not.toBe(hash3);
        expect(hash1.length).toBe(64); // 64 hex characters for SHA-256
    });

    it("should store hashed OTP and set resend cooldown flag", async () => {
        jest.spyOn(redisService, "exists").mockResolvedValue(false);
        const spySet = jest.spyOn(redisService, "set").mockResolvedValue(true);
        jest.spyOn(redisService, "delete").mockResolvedValue(true);

        const result = await otpService.storeOtp("email_verify", "user@example.com", "123456", 600, 60);
        expect(result).toEqual({ success: true });
        expect(spySet).toHaveBeenCalledTimes(2); // Stores OTP payload & cooldown flag
    });

    it("should enforce resend cooldown if requested before 60 seconds expire", async () => {
        jest.spyOn(redisService, "exists").mockImplementation(async (key) => {
            if (key.includes("cooldown")) return true;
            return false;
        });

        const result = await otpService.storeOtp("email_verify", "user@example.com", "123456", 600, 60);
        expect(result).toEqual({ success: false, reason: "COOLDOWN" });
    });

    it("should verify valid OTP, consume single-use key, and delete attempt counters", async () => {
        const rawOtp = "123456";
        const hashed = otpService.hashOtp(rawOtp);
        const payload = JSON.stringify({ hash: hashed, createdAt: Date.now() });

        jest.spyOn(redisService, "exists").mockResolvedValue(false);
        jest.spyOn(redisService, "get").mockResolvedValue(payload);
        const spyDel = jest.spyOn(redisService, "delete").mockResolvedValue(true);

        const result = await otpService.verifyOtp("email_verify", "user@example.com", rawOtp);
        expect(result).toEqual({ success: true });
        expect(spyDel).toHaveBeenCalled();
    });

    it("should track failed verification attempts and enforce 15-minute lockout at 5 failed attempts", async () => {
        const rawOtp = "123456";
        const hashed = otpService.hashOtp(rawOtp);
        const payload = JSON.stringify({ hash: hashed, createdAt: Date.now() });

        jest.spyOn(redisService, "exists").mockResolvedValue(false);
        jest.spyOn(redisService, "get").mockResolvedValue(payload);
        jest.spyOn(redisService, "increment").mockResolvedValue(5);
        const spySet = jest.spyOn(redisService, "set").mockResolvedValue(true);
        const spyDel = jest.spyOn(redisService, "delete").mockResolvedValue(true);

        const result = await otpService.verifyOtp("email_verify", "user@example.com", "999999");
        expect(result).toEqual({ success: false, reason: "LOCKED_OUT" });
        expect(spySet).toHaveBeenCalledWith(expect.stringContaining("lockout"), "1", 900);
        expect(spyDel).toHaveBeenCalled();
    });
});
