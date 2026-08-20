import { AppError } from "../../../../shared/errors/AppError.js";
import otpService from "../../../../infrastructure/otp/otp.service.js";
import emailPort from "../../../../infrastructure/email/email.port.js";
import redisClientManager from "../../../../infrastructure/redis/redis.client.js";

export class RequestEmailVerificationUseCase {
    constructor(emailVerificationRepository) {
        this.emailVerificationRepository = emailVerificationRepository;
    }

    async execute({ email }) {
        if (!email) {
            throw new AppError(400, "Email is required");
        }

        const normalizedEmail = String(email).trim().toLowerCase();

        // Fail-closed check: verify Redis is connected
        if (!redisClientManager.isRedisReady()) {
            throw new AppError(503, "Authentication verification service temporarily unavailable");
        }

        const otp = otpService.generateOtp();
        const storeResult = await otpService.storeOtp("email_verification", normalizedEmail, otp, 600, 60);

        if (!storeResult.success) {
            if (storeResult.reason === "COOLDOWN") {
                throw new AppError(429, "Please wait 60 seconds before requesting another code.");
            }
            if (storeResult.reason === "LOCKED_OUT") {
                throw new AppError(429, "Too many failed attempts. Account locked for 15 minutes.");
            }
            throw new AppError(503, "Verification service error");
        }

        await emailPort.sendEmail({
            to: normalizedEmail,
            subject: "Your Email Verification Code",
            text: `Your verification code is: ${otp}. This code expires in 10 minutes.`,
        });

        // Account enumeration protection: Generic response
        return { message: "If an account exists, a verification code has been dispatched" };
    }
}

export default RequestEmailVerificationUseCase;
