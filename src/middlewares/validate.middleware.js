import { ValidationError } from "../shared/errors/AppError.js";

export const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        if (parsed.body) req.body = parsed.body;
        if (parsed.query && typeof req.query === "object") {
            Object.assign(req.query, parsed.query);
        }
        if (parsed.params && typeof req.params === "object") {
            Object.assign(req.params, parsed.params);
        }
        next();
    } catch (error) {
        const issues = error.issues || error.errors;
        if (issues && Array.isArray(issues)) {
            const formattedErrors = issues.map((e) => `${e.path.join(".")}: ${e.message}`);
            return next(new ValidationError("Input validation failed", formattedErrors));
        }
        return next(error);
    }
};
