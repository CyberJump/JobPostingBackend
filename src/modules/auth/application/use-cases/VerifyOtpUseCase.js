import { AppError } from "../../../../shared/errors/AppError.js";
import otpService from "../../../../infrastructure/otp/otp.service.js";

export class VerifyOtpUseCase {
    async execute({ email, otp, purpose = "email_verify" }) {
        if (!email || !otp) {
            throw new AppError(400, "Email and OTP code are required");
        }

        const result = await otpService.verifyOtp(purpose, email, otp);

        if (!result.success) {
            if (result.reason === "LOCKED_OUT") {
                throw new AppError(429, "Too many failed attempts. Account locked for 15 minutes.");
            }
            throw new AppError(400, "Invalid or expired verification code");
        }

        return { success: true, message: "Verification code validated successfully" };
    }
}

export default VerifyOtpUseCase;
