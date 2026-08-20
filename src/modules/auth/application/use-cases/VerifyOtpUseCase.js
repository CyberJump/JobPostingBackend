import { AppError } from "../../../../shared/errors/AppError.js";
import otpService from "../../../../infrastructure/otp/otp.service.js";
import { User } from "../../../../models/user.models.js";

export class VerifyOtpUseCase {
    async execute({ email, otp, purpose = "email_verify" }) {
        if (!email || !otp) {
            throw new AppError(400, "Email and OTP code are required");
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const result = await otpService.verifyOtp(purpose, normalizedEmail, otp);

        if (!result.success) {
            if (result.reason === "LOCKED_OUT") {
                throw new AppError(429, "Too many failed attempts. Account locked for 15 minutes.");
            }
            throw new AppError(400, "Invalid or expired verification code");
        }

        if (purpose === "email_verify" || purpose === "email_verification") {
            await User.findOneAndUpdate(
                { email: normalizedEmail },
                { $set: { isVerified: true, status: "ACTIVE" } }
            ).exec();
        }

        return { success: true, message: "Verification code validated successfully" };
    }
}

export default VerifyOtpUseCase;
