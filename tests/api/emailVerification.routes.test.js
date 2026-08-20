import request from "supertest";
import app from "../../src/app.js";
import { jest } from "@jest/globals";
import otpService from "../../src/infrastructure/otp/otp.service.js";
import redisService from "../../src/infrastructure/redis/redis.service.js";
import { redisClientManager } from "../../src/infrastructure/redis/redis.client.js";
import config from "../../src/config/env.js";
import { User } from "../../src/models/user.models.js";

describe("Email Verification Routes API Endpoints (/api/v1/auth/email-verification/*)", () => {
    beforeEach(() => {
        config.redis.enabled = true;
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(true);
        jest.spyOn(redisService, "increment").mockResolvedValue(1);
        jest.spyOn(redisService, "expire").mockResolvedValue(true);

        const mockQuery = (val) => ({
            exec: jest.fn().mockResolvedValue(val),
        });
        jest.spyOn(User, "findOne").mockReturnValue(mockQuery({ 
            _id: "507f1f77bcf86cd799439011", 
            email: "user@example.com", 
            isVerified: false, 
            status: "PENDING" 
        }));
        jest.spyOn(User, "findByIdAndUpdate").mockReturnValue(mockQuery({ 
            _id: "507f1f77bcf86cd799439011", 
            isVerified: true, 
            status: "ACTIVE" 
        }));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("POST /api/v1/auth/email-verification/request should return 200 for valid email payload", async () => {
        jest.spyOn(otpService, "storeOtp").mockResolvedValue({ success: true });

        const response = await request(app)
            .post("/api/v1/auth/email-verification/request")
            .send({ email: "user@example.com" });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it("POST /api/v1/auth/email-verification/request should return 400 for invalid email format", async () => {
        const response = await request(app)
            .post("/api/v1/auth/email-verification/request")
            .send({ email: "invalid-email" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it("POST /api/v1/auth/email-verification/verify should return 200 for valid OTP verification", async () => {
        jest.spyOn(otpService, "verifyOtp").mockResolvedValue({ success: true });

        const response = await request(app)
            .post("/api/v1/auth/email-verification/verify")
            .send({ email: "user@example.com", otp: "123456" });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it("POST /api/v1/auth/email-verification/verify should return 400 for invalid OTP payload length", async () => {
        const response = await request(app)
            .post("/api/v1/auth/email-verification/verify")
            .send({ email: "user@example.com", otp: "123" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
});
