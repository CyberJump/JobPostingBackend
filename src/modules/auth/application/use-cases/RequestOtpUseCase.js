import { AppError } from "../../../../shared/errors/AppError.js";
import otpService from "../../../../infrastructure/otp/otp.service.js";
import emailPort from "../../../../infrastructure/email/email.port.js";

export class RequestOtpUseCase {
    async execute({ email, purpose = "email_verify" }) {
        if (!email) {
            throw new AppError(400, "Email is required");
        }

        const otp = otpService.generateOtp();

        if (process.env.NODE_ENV === "development") {
            console.log(`🔑 [OTP GENERATED] Email: ${email} | Purpose: ${purpose} | OTP: ${otp}`);
        }

        const storeResult = await otpService.storeOtp(purpose, email, otp, 600, 60);

        if (!storeResult.success) {
            if (storeResult.reason === "COOLDOWN") {
                throw new AppError(429, "Please wait 60 seconds before requesting another code.");
            }
            if (storeResult.reason === "LOCKED_OUT") {
                throw new AppError(429, "Too many failed attempts. Account locked for 15 minutes.");
            }
        }

        await emailPort.sendEmail({
            to: email,
            subject: "Your Verification Code",
            text: `Your code is: ${otp}`,
        });

        // Account enumeration protection: Generic response
        return { message: "If an account exists, a verification code has been dispatched" };
    }
}

export default RequestOtpUseCase;
