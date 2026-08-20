import pino from "pino";

export const logger = pino({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
    formatters: {
        level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
        paths: [
            "password",
            "oldPassword",
            "newPassword",
            "accessToken",
            "refreshToken",
            "headers.authorization",
            "headers.cookie",
            "req.headers.authorization",
            "req.headers.cookie",
        ],
        remove: true,
    },
});

export default logger;
