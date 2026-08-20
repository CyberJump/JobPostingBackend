import request from "supertest";
import app from "../../src/app.js";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import config from "../../src/config/env.js";
import { Company } from "../../src/models/company.models.js";
import { User } from "../../src/models/user.models.js";

describe("Companies Routes API Endpoints (/api/v1/companies/*)", () => {
    let companyAuthToken, studentAuthToken;
    const secret = config.auth?.accessTokenSecret || "test_access_token_secret";

    beforeEach(() => {
        config.auth.accessTokenSecret = secret;
        companyAuthToken = jwt.sign(
            { _id: "507f1f77bcf86cd799439011", email: "company@example.com", role: "COMPANY" },
            secret
        );
        studentAuthToken = jwt.sign(
            { _id: "507f1f77bcf86cd799439022", email: "student@example.com", role: "STUDENT" },
            secret
        );

        const mockUser = { _id: "507f1f77bcf86cd799439011", role: "COMPANY", status: "ACTIVE" };
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

    it("GET /api/v1/companies should return list of public companies", async () => {
        const mockPaginated = {
            docs: [{ _id: "comp123", name: "Acme Corp", status: "ACTIVE" }],
            totalDocs: 1,
            limit: 10,
            page: 1,
            totalPages: 1,
        };
        jest.spyOn(Company, "aggregatePaginate").mockResolvedValue(mockPaginated);

        const response = await request(app).get("/api/v1/companies");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.docs).toHaveLength(1);
    });

    it("POST /api/v1/companies/register should return 401 Unauthorized for role mismatch when accessed by STUDENT role", async () => {
        const studentUser = { _id: "507f1f77bcf86cd799439022", role: "STUDENT", status: "ACTIVE" };
        jest.spyOn(User, "findById").mockReturnValue({
            select: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(studentUser),
            then: (cb) => Promise.resolve(studentUser).then(cb),
        });

        const response = await request(app)
            .post("/api/v1/companies/register")
            .set("Authorization", `Bearer ${studentAuthToken}`)
            .send({
                name: "Student Corp",
                email: "info@studentcorp.com",
                description: "Unauthorized student company attempt",
            });

        expect(response.status).toBe(401);
    });
});
