export class AppError extends Error {
    constructor(statusCode = 500, message = "Internal Server Error", code = "INTERNAL_ERROR", details = []) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.success = false;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message = "Validation failed", details = []) {
        super(400, message, "VALIDATION_FAILED", details);
    }
}

export class AuthenticationError extends AppError {
    constructor(message = "Authentication required", details = []) {
        super(401, message, "AUTHENTICATION_FAILED", details);
    }
}

export class AuthorizationError extends AppError {
    constructor(message = "Forbidden access", details = []) {
        super(403, message, "AUTHORIZATION_FAILED", details);
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource not found", details = []) {
        super(404, message, "RESOURCE_NOT_FOUND", details);
    }
}

export class ConflictError extends AppError {
    constructor(message = "Conflict / Duplicate resource", details = []) {
        super(409, message, "RESOURCE_CONFLICT", details);
    }
}

export class RateLimitError extends AppError {
    constructor(message = "Too many requests. Please try again later.", details = []) {
        super(429, message, "RATE_LIMIT_EXCEEDED", details);
    }
}
