import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: "./.env" });

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.string().transform((val) => parseInt(val, 10)).default("8000"),
    MONGODB_URL: z.string({ required_error: "MONGODB_URL environment variable is required" }),
    ACCESS_TOKEN_SECRET: z.string({ required_error: "ACCESS_TOKEN_SECRET is required" }),
    ACCESS_TOKEN_EXPIRY: z.string().default("1d"),
    REFRESH_TOKEN_SECRET: z.string({ required_error: "REFRESH_TOKEN_SECRET is required" }),
    REFRESH_TOKEN_EXPIRY: z.string().default("10d"),
    CLOUDINARY_CLOUD_NAME: z.string({ required_error: "CLOUDINARY_CLOUD_NAME is required" }),
    CLOUDINARY_API_KEY: z.string({ required_error: "CLOUDINARY_API_KEY is required" }),
    CLOUDINARY_API_SECRET: z.string({ required_error: "CLOUDINARY_API_SECRET is required" }),
    ALLOWED_ORIGINS: z.string().optional().default("http://localhost:3000,http://localhost:5173"),
    REDIS_ENABLED: z.string().optional().transform((val) => val === "true" || val === undefined).default("true"),
    REDIS_URL: z.string().optional().default("redis://localhost:6379"),
    REDIS_KEY_PREFIX: z.string().optional().default("bc_api"),
    REDIS_CONNECT_TIMEOUT_MS: z.string().optional().transform((val) => parseInt(val || "5000", 10)).default("5000"),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional().default("587"),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    EMAIL_FROM: z.string().optional().default("noreply@jobposting.com"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("❌ Invalid environment variables configuration:", _env.error.format());
    if (process.env.NODE_ENV !== "test") {
        process.exit(1);
    }
}

export const env = _env.success ? _env.data : process.env;

export const config = {
    env: env.NODE_ENV,
    port: env.PORT || 8000,
    db: {
        url: env.MONGODB_URL,
    },
    auth: {
        accessTokenSecret: env.ACCESS_TOKEN_SECRET,
        accessTokenExpiry: env.ACCESS_TOKEN_EXPIRY,
        refreshTokenSecret: env.REFRESH_TOKEN_SECRET,
        refreshTokenExpiry: env.REFRESH_TOKEN_EXPIRY,
    },
    cloudinary: {
        cloudName: env.CLOUDINARY_CLOUD_NAME,
        apiKey: env.CLOUDINARY_API_KEY,
        apiSecret: env.CLOUDINARY_API_SECRET,
    },
    cors: {
        allowedOrigins: env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(",") : ["http://localhost:3000"],
    },
    redis: {
        enabled: env.NODE_ENV === "test" ? (process.env.REDIS_ENABLED === "true") : (env.REDIS_ENABLED !== false),
        url: env.REDIS_URL || "redis://localhost:6379",
        keyPrefix: env.REDIS_KEY_PREFIX || "bc_api",
        connectTimeoutMs: env.REDIS_CONNECT_TIMEOUT_MS || 5000,
    },
    email: {
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT || "587", 10),
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
        from: env.EMAIL_FROM || "noreply@jobposting.com",
    },
};

export default config;
