import request from "supertest";
import app from "../../src/app.js";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import config from "../../src/config/env.js";
import { Application } from "../../src/models/application.models.js";
import { User } from "../../src/models/user.models.js";

describe("Applications Routes API Endpoints (/api/v1/applications/*)", () => {
    let studentAuthToken, companyAuthToken;
    const secret = config.auth?.accessTokenSecret || "test_access_token_secret";

    beforeEach(() => {
        config.auth.accessTokenSecret = secret;
        studentAuthToken = jwt.sign(
            { _id: "507f1f77bcf86cd799439011", email: "student@example.com", role: "STUDENT" },
            secret
        );
        companyAuthToken = jwt.sign(
            { _id: "507f1f77bcf86cd799439022", email: "company@example.com", role: "COMPANY" },
            secret
        );

        const mockUser = { _id: "507f1f77bcf86cd799439011", role: "STUDENT", status: "ACTIVE" };
        const mockQuery = {
            select: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockUser),
            then: (cb) => Promise.resolve(mockUser).then(cb),
        };
        jest.spyOn(User, "findById").mockReturnValue(mockQuery);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("GET /api/v1/applications/my-applications should return student applications", async () => {
        const mockPaginated = {
            docs: [{ _id: "app123", status: "APPLIED" }],
            totalDocs: 1,
            limit: 10,
            page: 1,
            totalPages: 1,
        };
        jest.spyOn(Application, "aggregatePaginate").mockResolvedValue(mockPaginated);

        const response = await request(app)
            .get("/api/v1/applications/my-applications")
            .set("Authorization", `Bearer ${studentAuthToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.docs).toHaveLength(1);
    });

    it("GET /api/v1/applications/job/:jobId should return 401 Unauthorized for role mismatch when accessed by STUDENT role", async () => {
        const response = await request(app)
            .get("/api/v1/applications/job/507f1f77bcf86cd799439099")
            .set("Authorization", `Bearer ${studentAuthToken}`);

        expect(response.status).toBe(401);
    });
});
