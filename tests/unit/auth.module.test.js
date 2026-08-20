import { jest } from "@jest/globals";
import RegisterUserUseCase from "../../src/modules/auth/application/use-cases/RegisterUserUseCase.js";
import LoginUserUseCase from "../../src/modules/auth/application/use-cases/LoginUserUseCase.js";
import LogoutUserUseCase from "../../src/modules/auth/application/use-cases/LogoutUserUseCase.js";
import RefreshTokenUseCase from "../../src/modules/auth/application/use-cases/RefreshTokenUseCase.js";
import ChangePasswordUseCase from "../../src/modules/auth/application/use-cases/ChangePasswordUseCase.js";
import AuthPolicy from "../../src/modules/auth/domain/policies/AuthPolicy.js";

describe("Auth Domain Module Use Cases & Policies", () => {
    let mockIdentityRepo, mockTokenProvider;

    beforeEach(() => {
        mockIdentityRepo = {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findByUsername: jest.fn(),
            findByEmailOrUsername: jest.fn(),
            create: jest.fn(),
            updateRefreshToken: jest.fn(),
            updatePassword: jest.fn(),
        };
        mockTokenProvider = {
            generateAccessToken: jest.fn().mockReturnValue("mock_access_token"),
            generateRefreshToken: jest.fn().mockReturnValue("mock_refresh_token"),
            verifyAccessToken: jest.fn(),
            verifyRefreshToken: jest.fn(),
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("AuthPolicy should validate passwords and active status", () => {
        expect(AuthPolicy.isValidPassword("short")).toBe(false);
        expect(AuthPolicy.isValidPassword("validPass123")).toBe(true);

        expect(AuthPolicy.isAccountActive({ status: "BLOCKED" })).toBe(false);
        expect(AuthPolicy.isAccountActive({ status: "ACTIVE" })).toBe(true);

        expect(AuthPolicy.canAccessAdmin({ role: "STUDENT" })).toBe(false);
        expect(AuthPolicy.canAccessAdmin({ role: "ADMIN" })).toBe(true);
    });

    it("RegisterUserUseCase should register a new user successfully", async () => {
        mockIdentityRepo.findByEmailOrUsername.mockResolvedValue(null);
        mockIdentityRepo.create.mockResolvedValue({ _id: "user123" });
        mockIdentityRepo.findById.mockResolvedValue({
            _id: "user123",
            name: "John Doe",
            email: "john@example.com",
            username: "johndoe",
            role: "STUDENT",
            toObject: () => ({
                _id: "user123",
                name: "John Doe",
                email: "john@example.com",
                username: "johndoe",
                role: "STUDENT",
                password: "hashed_password",
            }),
        });

        const useCase = new RegisterUserUseCase(mockIdentityRepo);
        const result = await useCase.execute({
            name: "John Doe",
            email: "john@example.com",
            username: "johndoe",
            password: "password123",
        });

        expect(result.user._id).toBe("user123");
        expect(result.user.password).toBeUndefined();
        expect(mockIdentityRepo.create).toHaveBeenCalled();
    });

    it("LoginUserUseCase should verify credentials and issue tokens", async () => {
        const mockUser = {
            _id: "user123",
            email: "john@example.com",
            isPasswordCorrect: jest.fn().mockResolvedValue(true),
            toObject: () => ({
                _id: "user123",
                email: "john@example.com",
                password: "hashed_password",
            }),
        };
        mockIdentityRepo.findByEmail.mockResolvedValue(mockUser);
        mockIdentityRepo.findById.mockResolvedValue(mockUser);

        const useCase = new LoginUserUseCase(mockIdentityRepo, mockTokenProvider);
        const result = await useCase.execute({ email: "john@example.com", password: "password123" });

        expect(result.accessToken).toBe("mock_access_token");
        expect(result.refreshToken).toBe("mock_refresh_token");
        expect(mockIdentityRepo.updateRefreshToken).toHaveBeenCalledWith("user123", "mock_refresh_token");
    });

    it("LogoutUserUseCase should clear refresh token in persistence", async () => {
        const useCase = new LogoutUserUseCase(mockIdentityRepo);
        const result = await useCase.execute("user123");

        expect(result.success).toBe(true);
        expect(mockIdentityRepo.updateRefreshToken).toHaveBeenCalledWith("user123", undefined);
    });

    it("RefreshTokenUseCase should verify refresh token and reissue token pair", async () => {
        const mockUser = { _id: "user123", refreshToken: "valid_refresh_token" };
        mockTokenProvider.verifyRefreshToken.mockReturnValue({ _id: "user123" });
        mockIdentityRepo.findById.mockResolvedValue(mockUser);

        const useCase = new RefreshTokenUseCase(mockIdentityRepo, mockTokenProvider);
        const result = await useCase.execute("valid_refresh_token");

        expect(result.accessToken).toBe("mock_access_token");
        expect(result.refreshToken).toBe("mock_refresh_token");
    });

    it("ChangePasswordUseCase should verify old password and update new password", async () => {
        const mockUser = {
            _id: "user123",
            isPasswordCorrect: jest.fn().mockResolvedValue(true),
        };
        mockIdentityRepo.findById.mockResolvedValue(mockUser);

        const useCase = new ChangePasswordUseCase(mockIdentityRepo);
        const result = await useCase.execute("user123", { oldPassword: "oldPass123", newPassword: "newPass123" });

        expect(result.success).toBe(true);
        expect(mockIdentityRepo.updatePassword).toHaveBeenCalledWith("user123", "newPass123");
    });
});
