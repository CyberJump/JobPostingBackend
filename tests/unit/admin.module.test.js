import { jest } from "@jest/globals";
import CreateAdminUseCase from "../../src/modules/admin/application/use-cases/CreateAdminUseCase.js";
import RemoveAdminUseCase from "../../src/modules/admin/application/use-cases/RemoveAdminUseCase.js";
import BlockUserUseCase from "../../src/modules/admin/application/use-cases/BlockUserUseCase.js";
import UnblockUserUseCase from "../../src/modules/admin/application/use-cases/UnblockUserUseCase.js";
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

    it("ModerationPolicy should prevent blocking self or other admins directly", () => {
        const adminUser = { _id: "admin1", role: "ADMIN" };
        const otherAdmin = { _id: "admin2", role: "ADMIN" };
        const studentUser = { _id: "student1", role: "STUDENT" };

        expect(ModerationPolicy.canBlockUser(adminUser, studentUser)).toBe(true);
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

    it("BlockUserUseCase should block student user successfully", async () => {
        const adminUser = { _id: "admin1", role: "ADMIN" };
        const targetStudent = { _id: "student1", role: "STUDENT", status: "ACTIVE" };

        mockModerationRepo.findUserById.mockResolvedValue(targetStudent);
        mockModerationRepo.updateUserStatus.mockResolvedValue({ ...targetStudent, status: "BLOCKED" });

        const useCase = new BlockUserUseCase(mockModerationRepo);
        const result = await useCase.execute(adminUser, "student1");

        expect(result.status).toBe("BLOCKED");
        expect(mockModerationRepo.updateUserStatus).toHaveBeenCalledWith("student1", "BLOCKED");
    });
});
