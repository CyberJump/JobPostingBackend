import { AppError } from "../shared/errors/AppError.js";
import { logger } from "../shared/logging/logger.js";

export const globalErrorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || err.code || 500;
    let message = err.message || "Internal Server Error";
    let errorCode = err.code || "INTERNAL_ERROR";
    let details = err.details || [];

    // Sanitize invalid HTTP status codes
    if (typeof statusCode !== "number" || statusCode < 100 || statusCode >= 600) {
        statusCode = 500;
    }

    // Map Mongoose CastError / ValidationError
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
        errorCode = "INVALID_INPUT";
    } else if (err.name === "ValidationError" && err.errors) {
        statusCode = 400;
        message = "Database Validation Failed";
        errorCode = "VALIDATION_FAILED";
        details = Object.values(err.errors).map((e) => e.message);
    } else if (err.code === 11000) {
        statusCode = 409;
        message = "Duplicate key violation";
        errorCode = "DUPLICATE_RESOURCE";
    }

    const isProduction = process.env.NODE_ENV === "production";

    // Log operational vs programming errors
    if (statusCode >= 500) {
        logger.error({
            requestId: req.id,
            err,
            url: req.originalUrl,
            method: req.method,
        }, `[SERVER ERROR] ${message}`);
    } else {
        logger.warn({
            requestId: req.id,
            statusCode,
            code: errorCode,
            url: req.originalUrl,
            method: req.method,
        }, `[CLIENT ERROR] ${message}`);
    }

    return res.status(statusCode).json({
        success: false,
        error: {
            code: errorCode,
            message: isProduction && statusCode === 500 ? "Internal Server Error" : message,
            details: details.length > 0 ? details : undefined,
        },
        requestId: req.id || null,
        timestamp: new Date().toISOString(),
    });
};
