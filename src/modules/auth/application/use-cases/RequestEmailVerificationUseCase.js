import { AppError } from "../../../../shared/errors/AppError.js";
import otpService from "../../../../infrastructure/otp/otp.service.js";
import emailPort from "../../../../infrastructure/email/email.port.js";
import redisClientManager from "../../../../infrastructure/redis/redis.client.js";
import EmailVerificationPolicy from "../../domain/policies/EmailVerificationPolicy.js";

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

        // Check if user exists in database
        const user = await this.emailVerificationRepository.findByEmail(normalizedEmail);

        // Account enumeration protection: If user doesn't exist, return generic message without dispatching OTP
        if (!user) {
            return { message: "If an account exists, a verification code has been dispatched" };
        }

        // Check if account is already verified
        if (EmailVerificationPolicy.isAlreadyVerified(user)) {
            throw new AppError(400, "Email is already verified");
        }

        // Check if account is blocked
        if (user.status === "BLOCKED") {
            throw new AppError(403, "Account is blocked. Please contact support.");
        }

        // Generate cryptographic 6-digit OTP
        const otp = otpService.generateOtp();

        if (process.env.NODE_ENV === "development") {
            console.log(`🔑 [OTP GENERATED] Email: ${normalizedEmail} | OTP: ${otp}`);
        }

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

        // Dispatch plaintext OTP via email (never logged or persisted in plaintext)
        await emailPort.sendEmail({
            to: normalizedEmail,
            subject: "Your Email Verification Code",
            text: `Your email verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this verification, please ignore this email. Do not share this code with anyone.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #0f172a; margin-top: 0;">Email Verification</h2>
                    <p style="color: #334155; font-size: 16px;">Your 6-digit verification code is:</p>
                    <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-radius: 6px; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #2563eb; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="color: #64748b; font-size: 14px;">This code will expire in <strong>10 minutes</strong>.</p>
                    <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">If you did not create an account or request this verification, please ignore this email. Do not share this code with anyone.</p>
                </div>
            `,
        });

        return { message: "If an account exists, a verification code has been dispatched" };
    }
}

export default RequestEmailVerificationUseCase;
