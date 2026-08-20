import { AppError } from "../../../../shared/errors/AppError.js";
import otpService from "../../../../infrastructure/otp/otp.service.js";
import redisClientManager from "../../../../infrastructure/redis/redis.client.js";
import EmailVerificationPolicy from "../../domain/policies/EmailVerificationPolicy.js";

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

        // Validate user account status
        const user = await this.emailVerificationRepository.findByEmail(normalizedEmail);
        if (!user) {
            throw new AppError(404, "User account not found");
        }

        // Prevent repeated verification on already verified accounts
        if (EmailVerificationPolicy.isAlreadyVerified(user)) {
            throw new AppError(400, "Email is already verified");
        }

        if (user.status === "BLOCKED") {
            throw new AppError(403, "Account is blocked");
        }

        // Verify SHA-256 hashed OTP in Redis
        const result = await otpService.verifyOtp("email_verification", normalizedEmail, otp);

        if (!result.success) {
            if (result.reason === "LOCKED_OUT") {
                throw new AppError(429, "Too many failed attempts. Account locked for 15 minutes.");
            }
            if (result.reason === "INVALID_OTP") {
                const attemptsMsg = result.attemptsRemaining !== undefined ? ` (${result.attemptsRemaining} attempts remaining)` : "";
                throw new AppError(400, `Invalid verification code${attemptsMsg}`);
            }
            throw new AppError(400, "Invalid or expired verification code");
        }

        // Mark user email verified and activate account
        await this.emailVerificationRepository.markEmailVerified(user._id);

        return { success: true, message: "Email verified successfully" };
    }
}

export default VerifyEmailUseCase;
