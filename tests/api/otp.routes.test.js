import request from "supertest";
import app from "../../src/app.js";
import { jest } from "@jest/globals";
import otpService from "../../src/infrastructure/otp/otp.service.js";
import redisService from "../../src/infrastructure/redis/redis.service.js";
import { redisClientManager } from "../../src/infrastructure/redis/redis.client.js";
import config from "../../src/config/env.js";

describe("OTP Routes API Endpoints (/api/v1/auth/otp/*)", () => {
    beforeEach(() => {
        config.redis.enabled = true;
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(true);
        jest.spyOn(redisService, "increment").mockResolvedValue(1);
        jest.spyOn(redisService, "expire").mockResolvedValue(true);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("POST /api/v1/auth/otp/request should return 200 OK for valid email payload", async () => {
        jest.spyOn(otpService, "storeOtp").mockResolvedValue({ success: true });

        const response = await request(app)
            .post("/api/v1/auth/otp/request")
            .send({ email: "user@example.com", purpose: "email_verify" });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toContain("If an account exists");
    });

    it("POST /api/v1/auth/otp/request should return 400 Bad Request for invalid email format", async () => {
        const response = await request(app)
            .post("/api/v1/auth/otp/request")
            .send({ email: "not-an-email" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it("POST /api/v1/auth/otp/verify should return 200 OK for valid OTP verification", async () => {
        jest.spyOn(otpService, "verifyOtp").mockResolvedValue({ success: true });

        const response = await request(app)
            .post("/api/v1/auth/otp/verify")
            .send({ email: "user@example.com", otp: "123456", purpose: "email_verify" });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it("POST /api/v1/auth/otp/verify should return 400 for invalid OTP payload length", async () => {
        const response = await request(app)
            .post("/api/v1/auth/otp/verify")
            .send({ email: "user@example.com", otp: "123" });

        expect(response.status).toBe(400);
    });
});
