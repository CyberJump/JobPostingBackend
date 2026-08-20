import request from "supertest";
import app from "../../src/app.js";

describe("Health Check API Endpoints", () => {
    it("GET /api/v1 should return 200 OK with API details and X-Request-ID header", async () => {
        const response = await request(app).get("/api/v1");
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain("BusinessClinic API is running");
        expect(response.headers["x-request-id"]).toBeDefined();
    });

    it("GET /api/v1/health should return status healthy", async () => {
        const response = await request(app).get("/api/v1/health");
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("healthy");
        expect(response.headers["x-request-id"]).toBeDefined();
    });

    it("GET /api/v1/health/live should return 200 OK and alive status", async () => {
        const response = await request(app).get("/api/v1/health/live");
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("alive");
        expect(response.headers["x-request-id"]).toBeDefined();
    });

    it("GET /api/v1/health/ready should return readiness response with service checks", async () => {
        const response = await request(app).get("/api/v1/health/ready");
        expect(response.body.services).toBeDefined();
        expect(response.headers["x-request-id"]).toBeDefined();
    });
});
