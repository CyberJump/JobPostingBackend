import request from "supertest";
import app from "../../src/app.js";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import config from "../../src/config/env.js";
import { User } from "../../src/models/user.models.js";

describe("Admin & Moderation Routes API Endpoints (/api/v1/admin/*)", () => {
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

        const mockQuery = (val) => ({
            select: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(val),
            then: (cb) => Promise.resolve(val).then(cb),
        });

        jest.spyOn(User, "findById").mockImplementation((id) => {
            if (id === "507f1f77bcf86cd799439099") {
                return mockQuery({ _id: "507f1f77bcf86cd799439099", role: "ADMIN", status: "ACTIVE" });
            }
            return mockQuery({ _id: "507f1f77bcf86cd799439011", role: "STUDENT", status: "ACTIVE" });
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("GET /api/v1/admin/users should return 401 Unauthorized for non-admin user", async () => {
        const response = await request(app)
            .get("/api/v1/admin/users")
            .set("Authorization", `Bearer ${studentAuthToken}`);

        expect(response.status).toBe(401);
    });

    it("GET /api/v1/admin/users should return list of users for authenticated ADMIN", async () => {
        const mockUsers = [{ _id: "u1", name: "User 1", role: "STUDENT", status: "ACTIVE" }];
        jest.spyOn(User, "find").mockReturnValue({
            select: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockUsers),
        });
        jest.spyOn(User, "countDocuments").mockResolvedValue(1);

        const response = await request(app)
            .get("/api/v1/admin/users")
            .set("Authorization", `Bearer ${adminAuthToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.users).toBeDefined();
    });

    it("PATCH /api/v1/admin/users/:userId/verify should verify and activate pending user", async () => {
        const mockPendingUser = { _id: "507f1f77bcf86cd799439022", name: "Pending User", role: "STUDENT", status: "PENDING", isVerified: false };
        const mockActiveUser = { ...mockPendingUser, status: "ACTIVE", isVerified: true };

        const mockQuery = (val) => ({
            select: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(val),
            then: (cb) => Promise.resolve(val).then(cb),
        });

        jest.spyOn(User, "findById").mockImplementation((id) => {
            if (id === "507f1f77bcf86cd799439099") {
                return mockQuery({ _id: "507f1f77bcf86cd799439099", role: "ADMIN", status: "ACTIVE" });
            }
            if (id === "507f1f77bcf86cd799439022") {
                return mockQuery(mockPendingUser);
            }
            return mockQuery(null);
        });

        jest.spyOn(User, "findByIdAndUpdate").mockReturnValue({
            select: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockActiveUser),
        });

        const response = await request(app)
            .patch("/api/v1/admin/users/507f1f77bcf86cd799439022/verify")
            .set("Authorization", `Bearer ${adminAuthToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe("ACTIVE");
    });

    it("PATCH /api/v1/admin/users/:userId/block should return 400 when attempting to block a pending user", async () => {
        const mockPendingUser = { _id: "507f1f77bcf86cd799439022", name: "Pending User", role: "STUDENT", status: "PENDING" };

        const mockQuery = (val) => ({
            select: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(val),
            then: (cb) => Promise.resolve(val).then(cb),
        });

        jest.spyOn(User, "findById").mockImplementation((id) => {
            if (id === "507f1f77bcf86cd799439099") {
                return mockQuery({ _id: "507f1f77bcf86cd799439099", role: "ADMIN", status: "ACTIVE" });
            }
            if (id === "507f1f77bcf86cd799439022") {
                return mockQuery(mockPendingUser);
            }
            return mockQuery(null);
        });

        const response = await request(app)
            .patch("/api/v1/admin/users/507f1f77bcf86cd799439022/block")
            .set("Authorization", `Bearer ${adminAuthToken}`);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain("Cannot block a pending user");
    });
});
