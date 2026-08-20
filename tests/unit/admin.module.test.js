import { jest } from "@jest/globals";
import CreateAdminUseCase from "../../src/modules/admin/application/use-cases/CreateAdminUseCase.js";
import RemoveAdminUseCase from "../../src/modules/admin/application/use-cases/RemoveAdminUseCase.js";
import BlockUserUseCase from "../../src/modules/admin/application/use-cases/BlockUserUseCase.js";
import UnblockUserUseCase from "../../src/modules/admin/application/use-cases/UnblockUserUseCase.js";
import VerifyUserUseCase from "../../src/modules/admin/application/use-cases/VerifyUserUseCase.js";
import AdminPolicy from "../../src/modules/admin/domain/policies/AdminPolicy.js";
import ModerationPolicy from "../../src/modules/admin/domain/policies/ModerationPolicy.js";

describe("Admin & Moderation Domain Module Use Cases & Policies", () => {
    let mockAdminRepo, mockModerationRepo;

    beforeEach(() => {
        mockAdminRepo = {
            findById: jest.fn(),
            findByEmailOrUsername: jest.fn(),
            createAdmin: jest.fn(),
            updateRole: jest.fn(),
        };
        mockModerationRepo = {
            findUserById: jest.fn(),
            updateUserStatus: jest.fn(),
            verifyUser: jest.fn(),
            findUsers: jest.fn(),
            updateCompanyStatus: jest.fn(),
            findApplications: jest.fn(),
            deleteApplication: jest.fn(),
            findJobs: jest.fn(),
            updateJob: jest.fn(),
            deleteJob: jest.fn(),
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("AdminPolicy should validate admin role and prevent self-demotion", () => {
        const adminUser = { _id: "admin1", role: "ADMIN" };
        const otherAdmin = { _id: "admin2", role: "ADMIN" };
        const studentUser = { _id: "student1", role: "STUDENT" };

        expect(AdminPolicy.isAdmin(adminUser)).toBe(true);
        expect(AdminPolicy.canRemoveAdmin(adminUser, otherAdmin)).toBe(true);
        expect(AdminPolicy.canRemoveAdmin(adminUser, adminUser)).toBe(false);
        expect(AdminPolicy.canRemoveAdmin(studentUser, otherAdmin)).toBe(false);
    });

    it("ModerationPolicy should prevent blocking self, other admins, or already blocked users", () => {
        const adminUser = { _id: "admin1", role: "ADMIN" };
        const otherAdmin = { _id: "admin2", role: "ADMIN" };
        const activeStudent = { _id: "student1", role: "STUDENT", status: "ACTIVE" };
        const pendingStudent = { _id: "student2", role: "STUDENT", status: "PENDING" };
        const blockedStudent = { _id: "student3", role: "STUDENT", status: "BLOCKED" };

        expect(ModerationPolicy.canBlockUser(adminUser, activeStudent)).toBe(true);
        expect(ModerationPolicy.canBlockUser(adminUser, pendingStudent)).toBe(true);
        expect(ModerationPolicy.canBlockUser(adminUser, blockedStudent)).toBe(false);
        expect(ModerationPolicy.canBlockUser(adminUser, adminUser)).toBe(false);
        expect(ModerationPolicy.canBlockUser(adminUser, otherAdmin)).toBe(false);
    });

    it("CreateAdminUseCase should create admin when payload is valid", async () => {
        mockAdminRepo.findByEmailOrUsername.mockResolvedValue(null);
        mockAdminRepo.createAdmin.mockResolvedValue({ _id: "admin123", email: "admin@example.com", role: "ADMIN" });

        const useCase = new CreateAdminUseCase(mockAdminRepo);
        const result = await useCase.execute({
            name: "New Admin",
            username: "newadmin",
            email: "admin@example.com",
            password: "password123",
        });

        expect(result.role).toBe("ADMIN");
        expect(mockAdminRepo.createAdmin).toHaveBeenCalledWith(expect.objectContaining({ email: "admin@example.com" }));
    });

    it("BlockUserUseCase should block active student user successfully", async () => {
        const adminUser = { _id: "admin1", role: "ADMIN" };
        const targetStudent = { _id: "student1", role: "STUDENT", status: "ACTIVE" };

        mockModerationRepo.findUserById.mockResolvedValue(targetStudent);
        mockModerationRepo.updateUserStatus.mockResolvedValue({ ...targetStudent, status: "BLOCKED" });

        const useCase = new BlockUserUseCase(mockModerationRepo);
        const result = await useCase.execute(adminUser, "student1");

        expect(result.status).toBe("BLOCKED");
        expect(mockModerationRepo.updateUserStatus).toHaveBeenCalledWith("student1", "BLOCKED");
    });

    it("BlockUserUseCase should block a pending user successfully", async () => {
        const adminUser = { _id: "admin1", role: "ADMIN" };
        const pendingStudent = { _id: "student2", role: "STUDENT", status: "PENDING" };

        mockModerationRepo.findUserById.mockResolvedValue(pendingStudent);
        mockModerationRepo.updateUserStatus.mockResolvedValue({ ...pendingStudent, status: "BLOCKED" });

        const useCase = new BlockUserUseCase(mockModerationRepo);
        const result = await useCase.execute(adminUser, "student2");

        expect(result.status).toBe("BLOCKED");
        expect(mockModerationRepo.updateUserStatus).toHaveBeenCalledWith("student2", "BLOCKED");
    });

    it("UnblockUserUseCase should unblock a blocked user successfully", async () => {
        const adminUser = { _id: "admin1", role: "ADMIN" };
        const blockedStudent = { _id: "student1", role: "STUDENT", status: "BLOCKED" };

        mockModerationRepo.findUserById.mockResolvedValue(blockedStudent);
        mockModerationRepo.updateUserStatus.mockResolvedValue({ ...blockedStudent, status: "ACTIVE" });

        const useCase = new UnblockUserUseCase(mockModerationRepo);
        const result = await useCase.execute(adminUser, "student1");

        expect(result.status).toBe("ACTIVE");
        expect(mockModerationRepo.updateUserStatus).toHaveBeenCalledWith("student1", "ACTIVE");
    });

    it("UnblockUserUseCase should reject unblocking an active user", async () => {
        const adminUser = { _id: "admin1", role: "ADMIN" };
        const activeStudent = { _id: "student2", role: "STUDENT", status: "ACTIVE" };

        mockModerationRepo.findUserById.mockResolvedValue(activeStudent);

        const useCase = new UnblockUserUseCase(mockModerationRepo);
        await expect(useCase.execute(adminUser, "student2")).rejects.toThrow("User is not blocked");
    });

    it("VerifyUserUseCase should verify and activate a pending user successfully", async () => {
        const adminUser = { _id: "admin1", role: "ADMIN" };
        const pendingStudent = { _id: "student2", role: "STUDENT", status: "PENDING" };

        mockModerationRepo.findUserById.mockResolvedValue(pendingStudent);
        mockModerationRepo.verifyUser.mockResolvedValue({ ...pendingStudent, status: "ACTIVE", isVerified: true });

        const useCase = new VerifyUserUseCase(mockModerationRepo);
        const result = await useCase.execute(adminUser, "student2");

        expect(result.status).toBe("ACTIVE");
        expect(result.isVerified).toBe(true);
        expect(mockModerationRepo.verifyUser).toHaveBeenCalledWith("student2");
    });
});
