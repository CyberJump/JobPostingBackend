import request from "supertest";
import app from "../../src/app.js";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import config from "../../src/config/env.js";
import { Job } from "../../src/models/job.models.js";
import { User } from "../../src/models/user.models.js";

describe("Jobs Routes API Endpoints (/api/v1/jobs/*)", () => {
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

    it("GET /api/v1/jobs should return list of active jobs", async () => {
        const mockPaginated = {
            docs: [{ _id: "job123", title: "Backend Engineer", status: "ACTIVE" }],
            totalDocs: 1,
            limit: 10,
            page: 1,
            totalPages: 1,
        };
        jest.spyOn(Job, "aggregatePaginate").mockResolvedValue(mockPaginated);

        const response = await request(app).get("/api/v1/jobs");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.docs).toHaveLength(1);
    });

    it("POST /api/v1/jobs/create should return 401 Unauthorized for role mismatch when accessed by STUDENT role", async () => {
        const studentUser = { _id: "507f1f77bcf86cd799439022", role: "STUDENT", status: "ACTIVE" };
        jest.spyOn(User, "findById").mockReturnValue({
            select: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(studentUser),
            then: (cb) => Promise.resolve(studentUser).then(cb),
        });

        const response = await request(app)
            .post("/api/v1/jobs/create")
            .set("Authorization", `Bearer ${studentAuthToken}`)
            .send({
                title: "Student Job",
                company: "507f1f77bcf86cd799439099",
                description: "Unauthorized student job posting",
                requirements: ["Node.js"],
                location: "Remote",
                salary: "100000",
                jobType: "FULLTIME",
            });

        expect(response.status).toBe(401);
    });
});
