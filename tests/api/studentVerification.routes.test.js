import request from "supertest";
import app from "../../src/app.js";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import config from "../../src/config/env.js";
import { VerificationApplication } from "../../src/models/verificationApplication.models.js";
import { User } from "../../src/models/user.models.js";

describe("Student Verification Routes API Endpoints (/api/v1/verifications/*)", () => {
    let studentAuthToken, adminAuthToken;
    const secret = config.auth?.accessTokenSecret || "test_access_token_secret";

    beforeEach(() => {
        config.auth.accessTokenSecret = secret;
        studentAuthToken = jwt.sign(
            { _id: "507f1f77bcf86cd799439011", email: "student@example.com", role: "STUDENT" },
            secret
        );
        adminAuthToken = jwt.sign(
            { _id: "507f1f77bcf86cd799439099", email: "admin@example.com", role: "ADMIN" },
            secret
        );

        const mockUser = (role) => ({ _id: "507f1f77bcf86cd799439011", role, status: "ACTIVE" });
        const mockQuery = (val) => ({
            select: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(val),
            then: (cb) => Promise.resolve(val).then(cb),
        });
        jest.spyOn(User, "findById").mockReturnValue(mockQuery(mockUser("STUDENT")));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("GET /api/v1/verifications/my-request should return user verification status", async () => {
        const mockReq = { _id: "req123", status: "PENDING", userId: { _id: "507f1f77bcf86cd799439011" } };
        const mockQuery = {
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockReq),
        };
        jest.spyOn(VerificationApplication, "findOne").mockReturnValue(mockQuery);

        const response = await request(app)
            .get("/api/v1/verifications/my-request")
            .set("Authorization", `Bearer ${studentAuthToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe("PENDING");
    });

    it("GET /api/v1/verifications should return 401 Unauthorized for role mismatch when accessed by STUDENT role", async () => {
        const response = await request(app)
            .get("/api/v1/verifications")
            .set("Authorization", `Bearer ${studentAuthToken}`);

        expect(response.status).toBe(401);
    });
});
