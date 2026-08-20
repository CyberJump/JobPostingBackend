import { jest } from "@jest/globals";
import RequestEmailVerificationUseCase from "../../src/modules/auth/application/use-cases/RequestEmailVerificationUseCase.js";
import VerifyEmailUseCase from "../../src/modules/auth/application/use-cases/VerifyEmailUseCase.js";
import EmailVerificationPolicy from "../../src/modules/auth/domain/policies/EmailVerificationPolicy.js";
import otpService from "../../src/infrastructure/otp/otp.service.js";
import emailPort from "../../src/infrastructure/email/email.port.js";
import redisClientManager from "../../src/infrastructure/redis/redis.client.js";

describe("Email Verification Module Use Cases & Policies", () => {
    let mockRepo;

    beforeEach(() => {
        mockRepo = {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            markEmailVerified: jest.fn(),
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("EmailVerificationPolicy should evaluate verified status and purpose validation", () => {
        expect(EmailVerificationPolicy.isAlreadyVerified({ status: "ACTIVE" })).toBe(true);
        expect(EmailVerificationPolicy.isAlreadyVerified({ isVerified: true })).toBe(true);
        expect(EmailVerificationPolicy.isAlreadyVerified({ status: "PENDING" })).toBe(false);

        expect(EmailVerificationPolicy.isValidPurpose("email_verification")).toBe(true);
        expect(EmailVerificationPolicy.isValidPurpose("email_verify")).toBe(true);
        expect(EmailVerificationPolicy.isValidPurpose("password_reset")).toBe(false);
    });

    it("RequestEmailVerificationUseCase should generate OTP and send email", async () => {
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(true);
        jest.spyOn(otpService, "generateOtp").mockReturnValue("123456");
        jest.spyOn(otpService, "storeOtp").mockResolvedValue({ success: true });
        jest.spyOn(emailPort, "sendEmail").mockResolvedValue(true);

        const useCase = new RequestEmailVerificationUseCase(mockRepo);
        const result = await useCase.execute({ email: "user@example.com" });

        expect(result.message).toBe("If an account exists, a verification code has been dispatched");
        expect(otpService.storeOtp).toHaveBeenCalledWith("email_verification", "user@example.com", "123456", 600, 60);
        expect(emailPort.sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: "user@example.com" }));
    });

    it("RequestEmailVerificationUseCase should fail-closed with 503 when Redis is unavailable", async () => {
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(false);

        const useCase = new RequestEmailVerificationUseCase(mockRepo);
        await expect(useCase.execute({ email: "user@example.com" })).rejects.toThrow("Authentication verification service temporarily unavailable");
    });

    it("VerifyEmailUseCase should verify valid OTP and update user verified status", async () => {
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(true);
        jest.spyOn(otpService, "verifyOtp").mockResolvedValue({ success: true });
        mockRepo.findByEmail.mockResolvedValue({ _id: "user123", email: "user@example.com" });
        mockRepo.markEmailVerified.mockResolvedValue({ _id: "user123", isVerified: true, status: "ACTIVE" });

        const useCase = new VerifyEmailUseCase(mockRepo);
        const result = await useCase.execute({ email: "user@example.com", otp: "123456" });

        expect(result.success).toBe(true);
        expect(mockRepo.markEmailVerified).toHaveBeenCalledWith("user123");
    });

    it("VerifyEmailUseCase should fail-closed with 503 when Redis is unavailable", async () => {
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(false);

        const useCase = new VerifyEmailUseCase(mockRepo);
        await expect(useCase.execute({ email: "user@example.com", otp: "123456" })).rejects.toThrow("Authentication verification service temporarily unavailable");
    });
});
