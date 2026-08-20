import { jest } from "@jest/globals";
import { globalErrorHandler } from "../../src/middlewares/error.middleware.js";
import { 
    AppError, 
    ValidationError, 
    AuthenticationError, 
    AuthorizationError, 
    NotFoundError, 
    ConflictError, 
    RateLimitError 
} from "../../src/shared/errors/AppError.js";

describe("Global Error Handling Middleware Verification", () => {
    let req, res, next;

    beforeEach(() => {
        req = { id: "test-request-id-123", originalUrl: "/api/v1/test", method: "GET" };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
    });

    it("should handle 400 ValidationError", () => {
        const err = new ValidationError("Invalid field format", ["Email is required"]);
        globalErrorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            error: expect.objectContaining({
                code: "VALIDATION_FAILED",
                message: "Invalid field format",
                details: ["Email is required"]
            }),
            requestId: "test-request-id-123"
        }));
    });

    it("should handle 401 AuthenticationError", () => {
        const err = new AuthenticationError("Token missing");
        globalErrorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            error: expect.objectContaining({
                code: "AUTHENTICATION_FAILED",
                message: "Token missing"
            })
        }));
    });

    it("should handle 403 AuthorizationError", () => {
        const err = new AuthorizationError("Access denied");
        globalErrorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            error: expect.objectContaining({
                code: "AUTHORIZATION_FAILED",
                message: "Access denied"
            })
        }));
    });

    it("should handle 404 NotFoundError", () => {
        const err = new NotFoundError("Job not found");
        globalErrorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            error: expect.objectContaining({
                code: "RESOURCE_NOT_FOUND",
                message: "Job not found"
            })
        }));
    });

    it("should handle 409 ConflictError", () => {
        const err = new ConflictError("User already exists");
        globalErrorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            error: expect.objectContaining({
                code: "RESOURCE_CONFLICT",
                message: "User already exists"
            })
        }));
    });

    it("should handle 422 Unprocessable Entity custom error", () => {
        const err = new AppError(422, "Unprocessable Entity", "UNPROCESSABLE_ENTITY");
        globalErrorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            error: expect.objectContaining({
                code: "UNPROCESSABLE_ENTITY",
                message: "Unprocessable Entity"
            })
        }));
    });

    it("should handle 429 RateLimitError", () => {
        const err = new RateLimitError("Rate limit exceeded");
        globalErrorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            error: expect.objectContaining({
                code: "RATE_LIMIT_EXCEEDED",
                message: "Rate limit exceeded"
            })
        }));
    });

    it("should handle 500 Internal Error and sanitize message in production", () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "production";
        const err = new Error("Database internal crash dump details");
        globalErrorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            error: expect.objectContaining({
                code: "INTERNAL_ERROR",
                message: "Internal Server Error"
            })
        }));
        process.env.NODE_ENV = originalEnv;
    });
});
