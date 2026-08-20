import { jest } from "@jest/globals";
import GetCurrentUserUseCase from "../../src/modules/users/application/use-cases/GetCurrentUserUseCase.js";
import UpdateAccountDetailsUseCase from "../../src/modules/users/application/use-cases/UpdateAccountDetailsUseCase.js";
import UpdateProfilePhotoUseCase from "../../src/modules/users/application/use-cases/UpdateProfilePhotoUseCase.js";
import UserPolicy from "../../src/modules/users/domain/policies/UserPolicy.js";

describe("Users Domain Module Use Cases & Policies", () => {
    let mockUserRepo;

    beforeEach(() => {
        mockUserRepo = {
            findById: jest.fn(),
            updateAccountDetails: jest.fn(),
            updateProfilePhoto: jest.fn(),
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("UserPolicy should enforce ownership check and sanitize fields", () => {
        expect(UserPolicy.canUpdateProfile("user123", "user123")).toBe(true);
        expect(UserPolicy.canUpdateProfile("user123", "user456")).toBe(false);

        const sanitized = UserPolicy.sanitizeUpdateFields({
            name: "New Name",
            password: "hackedPassword",
            role: "ADMIN",
        });

        expect(sanitized.name).toBe("New Name");
        expect(sanitized.password).toBeUndefined();
        expect(sanitized.role).toBeUndefined();
    });

    it("GetCurrentUserUseCase should fetch user profile", async () => {
        mockUserRepo.findById.mockResolvedValue({ _id: "user123", name: "John Doe" });

        const useCase = new GetCurrentUserUseCase(mockUserRepo);
        const result = await useCase.execute("user123");

        expect(result._id).toBe("user123");
        expect(mockUserRepo.findById).toHaveBeenCalledWith("user123");
    });

    it("UpdateAccountDetailsUseCase should sanitize and update user account details", async () => {
        mockUserRepo.updateAccountDetails.mockResolvedValue({ _id: "user123", name: "Updated Name" });

        const useCase = new UpdateAccountDetailsUseCase(mockUserRepo);
        const result = await useCase.execute("user123", { name: "Updated Name", password: "ignored" });

        expect(result.name).toBe("Updated Name");
        expect(mockUserRepo.updateAccountDetails).toHaveBeenCalledWith("user123", { name: "Updated Name" });
    });
});
