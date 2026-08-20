import { jest } from "@jest/globals";
import SubmitApplicationUseCase from "../../src/modules/applications/application/use-cases/SubmitApplicationUseCase.js";
import GetApplicationUseCase from "../../src/modules/applications/application/use-cases/GetApplicationUseCase.js";
import WithdrawApplicationUseCase from "../../src/modules/applications/application/use-cases/WithdrawApplicationUseCase.js";
import ReviewApplicationUseCase from "../../src/modules/applications/application/use-cases/ReviewApplicationUseCase.js";
import ApplicationPolicy from "../../src/modules/applications/domain/policies/ApplicationPolicy.js";

describe("Applications Domain Module Use Cases & Policies", () => {
    let mockAppRepo;

    beforeEach(() => {
        mockAppRepo = {
            findById: jest.fn(),
            findByJobAndStudent: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findStudentApplications: jest.fn(),
            findJobApplications: jest.fn(),
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("ApplicationPolicy should evaluate student ownership and withdrawal timeframe", () => {
        const appRecent = {
            _id: "app123",
            student: { _id: "student123" },
            createdAt: new Date().toISOString(),
        };

        expect(ApplicationPolicy.isOwnerStudent(appRecent, "student123")).toBe(true);
        expect(ApplicationPolicy.canWithdraw(appRecent, "student123")).toBe(true);

        const appOld = {
            _id: "app456",
            student: { _id: "student123" },
            createdAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
        };

        expect(ApplicationPolicy.canWithdraw(appOld, "student123")).toBe(false);
    });

    it("GetApplicationUseCase should return application status for owner student", async () => {
        mockAppRepo.findById.mockResolvedValue({ _id: "app123", student: { _id: "student123" }, status: "APPLIED" });

        const useCase = new GetApplicationUseCase(mockAppRepo);
        const result = await useCase.execute("student123", "app123");

        expect(result.status).toBe("APPLIED");
        expect(mockAppRepo.findById).toHaveBeenCalledWith("app123");
    });

    it("WithdrawApplicationUseCase should delete application within 24 hours", async () => {
        const appRecent = {
            _id: "app123",
            student: { _id: "student123" },
            createdAt: new Date().toISOString(),
        };
        mockAppRepo.findById.mockResolvedValue(appRecent);
        mockAppRepo.delete.mockResolvedValue({ _id: "app123" });

        const useCase = new WithdrawApplicationUseCase(mockAppRepo);
        const result = await useCase.execute("student123", "app123");

        expect(result.success).toBe(true);
        expect(mockAppRepo.delete).toHaveBeenCalledWith("app123");
    });

    it("ReviewApplicationUseCase should update application status when authorized", async () => {
        const application = {
            _id: "app123",
            job: { company: { founders: [{ userId: "founder123" }] } },
        };
        mockAppRepo.findById.mockResolvedValue(application);
        mockAppRepo.update.mockResolvedValue({ _id: "app123", status: "SHORTLISTED" });

        const useCase = new ReviewApplicationUseCase(mockAppRepo);
        const result = await useCase.execute(
            { _id: "founder123", role: "COMPANY" },
            "app123",
            { status: "SHORTLISTED" }
        );

        expect(result.status).toBe("SHORTLISTED");
        expect(mockAppRepo.update).toHaveBeenCalledWith("app123", expect.objectContaining({ status: "SHORTLISTED" }));
    });
});
