import { describe, it, expect, jest } from "@jest/globals";
import { asynchandler } from "../../src/utils/asynchandler.js";
import { 
    AppError, 
    ValidationError, 
    AuthenticationError, 
    AuthorizationError, 
    NotFoundError, 
    ConflictError, 
    RateLimitError 
} from "../../src/shared/errors/AppError.js";

describe("Async Handler Middleware Unit Tests (CHG-0019)", () => {
    it("should resolve and execute successful async handler functions", async () => {
        const req = {};
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        const handler = asynchandler(async (req, res) => {
            res.status(200).json({ success: true });
        });

        await handler(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true });
        expect(next).not.toHaveBeenCalled();
    });

    it("should delegate errors to next(error) when next function is provided", async () => {
        const req = {};
        const res = {};
        const next = jest.fn();
        const testError = new Error("Async database error");

        const handler = asynchandler(async () => {
            throw testError;
        });

        await handler(req, res, next);
        expect(next).toHaveBeenCalledWith(testError);
    });

    it("should sanitize string error codes like INTERNAL_ERROR to 500 when handling inline", async () => {
        const req = {};
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const malformedError = { code: "INTERNAL_ERROR", message: "Database failure" };

        const handler = asynchandler(async () => {
            throw malformedError;
        });

        // Pass null as next to trigger inline status sanitization fallback
        await handler(req, res, null);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Database failure" });
    });

    describe("Invalid Status Sanitization Fallback Matrix (CRIT-001)", () => {
        const invalidCases = [
            { code: "INTERNAL_ERROR", desc: "string error code" },
            { code: "NOT_FOUND", desc: "string error name" },
            { code: "500", desc: "string number" },
            { code: null, desc: "null code" },
            { code: undefined, desc: "undefined code" },
            { code: NaN, desc: "NaN" },
            { code: Infinity, desc: "Infinity" },
            { code: -Infinity, desc: "-Infinity" },
            { code: -1, desc: "negative number" },
            { code: 0, desc: "zero" },
            { code: 99, desc: "status code below 100" },
            { code: 600, desc: "status code 600" },
            { code: 999, desc: "status code 999" },
            { code: {}, desc: "empty object" },
            { code: [], desc: "array" },
            { code: Symbol("invalid"), desc: "symbol" },
        ];

        invalidCases.forEach(({ code, desc }) => {
            it(`should sanitize invalid status [${desc}] safely to 500 without throwing TypeError`, async () => {
                const req = {};
                const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
                const err = { code, message: "Test error" };

                const handler = asynchandler(async () => {
                    throw err;
                });

                await handler(req, res, null);
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({ success: false, message: "Test error" });
            });
        });
    });

    describe("Valid HTTP Status Code Matrix", () => {
        const validStatuses = [100, 200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500, 503, 599];

        validStatuses.forEach((statusCode) => {
            it(`should preserve valid HTTP status code [${statusCode}]`, async () => {
                const req = {};
                const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
                const err = { statusCode, message: `Status ${statusCode}` };

                const handler = asynchandler(async () => {
                    throw err;
                });

                await handler(req, res, null);
                expect(res.status).toHaveBeenCalledWith(statusCode);
                expect(res.json).toHaveBeenCalledWith({ success: false, message: `Status ${statusCode}` });
            });
        });
    });

    describe("AppError Subclasses Compatibility Matrix", () => {
        const appErrors = [
            { error: new ValidationError("Invalid input"), expectedStatus: 400 },
            { error: new AuthenticationError("Unauthorized access"), expectedStatus: 401 },
            { error: new AuthorizationError("Forbidden resource"), expectedStatus: 403 },
            { error: new NotFoundError("User not found"), expectedStatus: 404 },
            { error: new ConflictError("Email already exists"), expectedStatus: 409 },
            { error: new RateLimitError("Rate limit exceeded"), expectedStatus: 429 },
            { error: new AppError(500, "Database crash"), expectedStatus: 500 },
            { error: new AppError(503, "Redis offline"), expectedStatus: 503 },
        ];

        appErrors.forEach(({ error, expectedStatus }) => {
            it(`should correctly preserve AppError subclass status [${error.constructor.name} -> ${expectedStatus}]`, async () => {
                const req = {};
                const res = {};
                const next = jest.fn();

                const handler = asynchandler(async () => {
                    throw error;
                });

                await handler(req, res, next);
                expect(next).toHaveBeenCalledWith(error);
                expect(error.statusCode).toBe(expectedStatus);
            });
        });
    });

    it("should safely handle malformed errors such as Object.create(null)", async () => {
        const req = {};
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const nullObjectErr = Object.create(null);
        nullObjectErr.message = "Object without prototype";

        const handler = asynchandler(async () => {
            throw nullObjectErr;
        });

        await handler(req, res, null);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Object without prototype" });
    });
});
