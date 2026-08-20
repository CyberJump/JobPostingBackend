import { AppError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError } from "../../src/shared/errors/AppError.js";

describe("AppError Hierarchy", () => {
    it("should instantiate AppError with defaults", () => {
        const err = new AppError();
        expect(err.statusCode).toBe(500);
        expect(err.message).toBe("Internal Server Error");
        expect(err.code).toBe("INTERNAL_ERROR");
        expect(err.success).toBe(false);
    });

    it("should instantiate ValidationError with 400 status", () => {
        const err = new ValidationError("Invalid email", ["Email format invalid"]);
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe("VALIDATION_FAILED");
        expect(err.details).toEqual(["Email format invalid"]);
    });

    it("should instantiate AuthenticationError with 401 status", () => {
        const err = new AuthenticationError();
        expect(err.statusCode).toBe(401);
        expect(err.code).toBe("AUTHENTICATION_FAILED");
    });

    it("should instantiate AuthorizationError with 403 status", () => {
        const err = new AuthorizationError();
        expect(err.statusCode).toBe(403);
        expect(err.code).toBe("AUTHORIZATION_FAILED");
    });

    it("should instantiate NotFoundError with 404 status", () => {
        const err = new NotFoundError();
        expect(err.statusCode).toBe(404);
        expect(err.code).toBe("RESOURCE_NOT_FOUND");
    });
});
