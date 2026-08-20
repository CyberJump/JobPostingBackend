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
        expect(EmailVerificationPolicy.isAlreadyVerified({ status: "PENDING", isVerified: false })).toBe(false);

        expect(EmailVerificationPolicy.isValidPurpose("email_verification")).toBe(true);
        expect(EmailVerificationPolicy.isValidPurpose("email_verify")).toBe(true);
        expect(EmailVerificationPolicy.isValidPurpose("password_reset")).toBe(false);
    });

    it("RequestEmailVerificationUseCase should generate OTP and send email for eligible unverified user", async () => {
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(true);
        jest.spyOn(otpService, "generateOtp").mockReturnValue("123456");
        jest.spyOn(otpService, "storeOtp").mockResolvedValue({ success: true });
        jest.spyOn(emailPort, "sendEmail").mockResolvedValue({ success: true, messageId: "msg_123" });
        mockRepo.findByEmail.mockResolvedValue({ _id: "user123", email: "user@example.com", status: "PENDING", isVerified: false });

        const useCase = new RequestEmailVerificationUseCase(mockRepo);
        const result = await useCase.execute({ email: "user@example.com" });

        expect(result.message).toBe("If an account exists, a verification code has been dispatched");
        expect(otpService.storeOtp).toHaveBeenCalledWith("email_verification", "user@example.com", "123456", 600, 60);
        expect(emailPort.sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: "user@example.com" }));
    });

    it("RequestEmailVerificationUseCase should return generic message when user does not exist (enumeration protection)", async () => {
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(true);
        const storeOtpSpy = jest.spyOn(otpService, "storeOtp");
        mockRepo.findByEmail.mockResolvedValue(null);

        const useCase = new RequestEmailVerificationUseCase(mockRepo);
        const result = await useCase.execute({ email: "unknown@example.com" });

        expect(result.message).toBe("If an account exists, a verification code has been dispatched");
        expect(storeOtpSpy).not.toHaveBeenCalled();
    });

    it("RequestEmailVerificationUseCase should reject when account is already verified", async () => {
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(true);
        mockRepo.findByEmail.mockResolvedValue({ _id: "user123", email: "user@example.com", status: "ACTIVE", isVerified: true });

        const useCase = new RequestEmailVerificationUseCase(mockRepo);
        await expect(useCase.execute({ email: "user@example.com" })).rejects.toThrow("Email is already verified");
    });

    it("RequestEmailVerificationUseCase should reject when account is blocked", async () => {
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(true);
        mockRepo.findByEmail.mockResolvedValue({ _id: "user123", email: "user@example.com", status: "BLOCKED", isVerified: false });

        const useCase = new RequestEmailVerificationUseCase(mockRepo);
        await expect(useCase.execute({ email: "user@example.com" })).rejects.toThrow("Account is blocked. Please contact support.");
    });

    it("RequestEmailVerificationUseCase should enforce 60s cooldown", async () => {
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(true);
        mockRepo.findByEmail.mockResolvedValue({ _id: "user123", email: "user@example.com", status: "PENDING", isVerified: false });
        jest.spyOn(otpService, "generateOtp").mockReturnValue("123456");
        jest.spyOn(otpService, "storeOtp").mockResolvedValue({ success: false, reason: "COOLDOWN" });

        const useCase = new RequestEmailVerificationUseCase(mockRepo);
        await expect(useCase.execute({ email: "user@example.com" })).rejects.toThrow("Please wait 60 seconds before requesting another code.");
    });

    it("RequestEmailVerificationUseCase should enforce lockout on excessive requests", async () => {
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(true);
        mockRepo.findByEmail.mockResolvedValue({ _id: "user123", email: "user@example.com", status: "PENDING", isVerified: false });
        jest.spyOn(otpService, "generateOtp").mockReturnValue("123456");
        jest.spyOn(otpService, "storeOtp").mockResolvedValue({ success: false, reason: "LOCKED_OUT" });

        const useCase = new RequestEmailVerificationUseCase(mockRepo);
        await expect(useCase.execute({ email: "user@example.com" })).rejects.toThrow("Too many failed attempts. Account locked for 15 minutes.");
    });

    it("RequestEmailVerificationUseCase should fail-closed with 503 when Redis is unavailable", async () => {
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(false);

        const useCase = new RequestEmailVerificationUseCase(mockRepo);
        await expect(useCase.execute({ email: "user@example.com" })).rejects.toThrow("Authentication verification service temporarily unavailable");
    });

    it("VerifyEmailUseCase should verify valid OTP and update user verified status", async () => {
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(true);
        jest.spyOn(otpService, "verifyOtp").mockResolvedValue({ success: true });
        mockRepo.findByEmail.mockResolvedValue({ _id: "user123", email: "user@example.com", status: "PENDING", isVerified: false });
        mockRepo.markEmailVerified.mockResolvedValue({ _id: "user123", isVerified: true, status: "ACTIVE" });

        const useCase = new VerifyEmailUseCase(mockRepo);
        const result = await useCase.execute({ email: "user@example.com", otp: "123456" });

        expect(result.success).toBe(true);
        expect(mockRepo.markEmailVerified).toHaveBeenCalledWith("user123");
    });

    it("VerifyEmailUseCase should reject if user does not exist", async () => {
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(true);
        mockRepo.findByEmail.mockResolvedValue(null);

        const useCase = new VerifyEmailUseCase(mockRepo);
        await expect(useCase.execute({ email: "user@example.com", otp: "123456" })).rejects.toThrow("User account not found");
    });

    it("VerifyEmailUseCase should reject if user is already verified", async () => {
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(true);
        mockRepo.findByEmail.mockResolvedValue({ _id: "user123", email: "user@example.com", status: "ACTIVE", isVerified: true });

        const useCase = new VerifyEmailUseCase(mockRepo);
        await expect(useCase.execute({ email: "user@example.com", otp: "123456" })).rejects.toThrow("Email is already verified");
    });

    it("VerifyEmailUseCase should reject if user is blocked", async () => {
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(true);
        mockRepo.findByEmail.mockResolvedValue({ _id: "user123", email: "user@example.com", status: "BLOCKED", isVerified: false });

        const useCase = new VerifyEmailUseCase(mockRepo);
        await expect(useCase.execute({ email: "user@example.com", otp: "123456" })).rejects.toThrow("Account is blocked");
    });

    it("VerifyEmailUseCase should reject with attempts remaining on invalid OTP", async () => {
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(true);
        mockRepo.findByEmail.mockResolvedValue({ _id: "user123", email: "user@example.com", status: "PENDING", isVerified: false });
        jest.spyOn(otpService, "verifyOtp").mockResolvedValue({ success: false, reason: "INVALID_OTP", attemptsRemaining: 4 });

        const useCase = new VerifyEmailUseCase(mockRepo);
        await expect(useCase.execute({ email: "user@example.com", otp: "000000" })).rejects.toThrow("Invalid verification code (4 attempts remaining)");
    });

    it("VerifyEmailUseCase should reject when locked out", async () => {
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(true);
        mockRepo.findByEmail.mockResolvedValue({ _id: "user123", email: "user@example.com", status: "PENDING", isVerified: false });
        jest.spyOn(otpService, "verifyOtp").mockResolvedValue({ success: false, reason: "LOCKED_OUT" });

        const useCase = new VerifyEmailUseCase(mockRepo);
        await expect(useCase.execute({ email: "user@example.com", otp: "123456" })).rejects.toThrow("Too many failed attempts. Account locked for 15 minutes.");
    });

    it("VerifyEmailUseCase should fail-closed with 503 when Redis is unavailable", async () => {
        jest.spyOn(redisClientManager, "isRedisReady").mockReturnValue(false);

        const useCase = new VerifyEmailUseCase(mockRepo);
        await expect(useCase.execute({ email: "user@example.com", otp: "123456" })).rejects.toThrow("Authentication verification service temporarily unavailable");
    });
});
