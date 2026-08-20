import request from "supertest";
import app from "../../src/app.js";

describe("CORS Security Middleware Verification", () => {
    it("should allow requests from configured allowed origin with credentials", async () => {
        const response = await request(app)
            .get("/api/v1/health")
            .set("Origin", "http://localhost:3000");
        
        expect(response.status).toBe(200);
        expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
        expect(response.headers["access-control-allow-credentials"]).toBe("true");
    });

    it("should allow requests with no Origin header (server-to-server / curl / health check)", async () => {
        const response = await request(app).get("/api/v1/health");
        expect(response.status).toBe(200);
    });

    it("should reject requests from unauthorized origins", async () => {
        const response = await request(app)
            .get("/api/v1/health")
            .set("Origin", "http://malicious-hacker-site.com");
        
        expect(response.status).toBe(500); // Express CORS middleware passes Error to error handler
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain("CORS policy violation");
    });
});
