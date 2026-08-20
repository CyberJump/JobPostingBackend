import crypto from "crypto";

export const requestContextMiddleware = (req, res, next) => {
    const requestId = req.header("X-Request-ID") || crypto.randomUUID();
    req.id = requestId;
    res.setHeader("X-Request-ID", requestId);
    next();
};
