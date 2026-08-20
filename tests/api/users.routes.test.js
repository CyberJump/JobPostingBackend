import request from "supertest";
import app from "../../src/app.js";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import config from "../../src/config/env.js";
import { User } from "../../src/models/user.models.js";

describe("Users Routes API Endpoints (/api/v1/users/*)", () => {
    let authToken;
    const secret = config.auth?.accessTokenSecret || "test_access_token_secret";

    beforeEach(() => {
        config.auth.accessTokenSecret = secret;
        authToken = jwt.sign(
            { _id: "507f1f77bcf86cd799439011", email: "user@example.com", role: "STUDENT" },
            secret
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("GET /api/v1/users/current-user should return 401 Unauthorized when missing token", async () => {
        const response = await request(app).get("/api/v1/users/current-user");
        expect(response.status).toBe(401);
    });

    it("GET /api/v1/users/current-user should return user profile for authenticated request", async () => {
        const mockUser = {
            _id: "507f1f77bcf86cd799439011",
            name: "John Doe",
            email: "user@example.com",
            role: "STUDENT",
            toObject: () => ({ _id: "507f1f77bcf86cd799439011", name: "John Doe", email: "user@example.com", role: "STUDENT" }),
        };

        const mockQuery = {
            select: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockUser),
            then: (cb) => Promise.resolve(mockUser).then(cb),
        };
        jest.spyOn(User, "findById").mockReturnValue(mockQuery);

        const response = await request(app)
            .get("/api/v1/users/current-user")
            .set("Authorization", `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it("PATCH /api/v1/users/update-account should return 400 Bad Request when payload is empty", async () => {
        const mockUser = { _id: "507f1f77bcf86cd799439011" };
        const mockQuery = {
            select: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockUser),
            then: (cb) => Promise.resolve(mockUser).then(cb),
        };
        jest.spyOn(User, "findById").mockReturnValue(mockQuery);

        const response = await request(app)
            .patch("/api/v1/users/update-account")
            .set("Authorization", `Bearer ${authToken}`)
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
});
