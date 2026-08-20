export const asynchandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => {
            if (typeof next === "function") {
                return next(error);
            }

            let statusCode = (error && typeof error === "object" && ("statusCode" in error || "code" in error))
                ? (error.statusCode || error.code)
                : 500;

            if (typeof statusCode !== "number" || !Number.isInteger(statusCode) || statusCode < 100 || statusCode >= 600) {
                statusCode = 500;
            }

            return res.status(statusCode).json({
                success: false,
                message: (error && error.message) ? error.message : "Internal Server Error",
            });
        });
    };
};

export default asynchandler;