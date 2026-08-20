import { AppError } from "../../../../shared/errors/AppError.js";
import otpService from "../../../../infrastructure/otp/otp.service.js";
import redisClientManager from "../../../../infrastructure/redis/redis.client.js";

export class VerifyEmailUseCase {
    constructor(emailVerificationRepository) {
        this.emailVerificationRepository = emailVerificationRepository;
    }

    async execute({ email, otp }) {
        if (!email || !otp) {
            throw new AppError(400, "Email and OTP code are required");
        }

        const normalizedEmail = String(email).trim().toLowerCase();

        // Fail-closed check: verify Redis is connected
        if (!redisClientManager.isRedisReady()) {
            throw new AppError(503, "Authentication verification service temporarily unavailable");
        }

        const result = await otpService.verifyOtp("email_verification", normalizedEmail, otp);

        if (!result.success) {
            if (result.reason === "LOCKED_OUT") {
                throw new AppError(429, "Too many failed attempts. Account locked for 15 minutes.");
            }
            throw new AppError(400, "Invalid or expired verification code");
        }

        const user = await this.emailVerificationRepository.findByEmail(normalizedEmail);
        if (user) {
            await this.emailVerificationRepository.markEmailVerified(user._id);
        }

        return { success: true, message: "Email verified successfully" };
    }
}

export default VerifyEmailUseCase;
