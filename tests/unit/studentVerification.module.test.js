import { jest } from "@jest/globals";
import SubmitStudentVerificationUseCase from "../../src/modules/verification/application/use-cases/SubmitStudentVerificationUseCase.js";
import GetStudentVerificationStatusUseCase from "../../src/modules/verification/application/use-cases/GetStudentVerificationStatusUseCase.js";
import ReviewStudentVerificationUseCase from "../../src/modules/verification/application/use-cases/ReviewStudentVerificationUseCase.js";
import StudentVerificationPolicy from "../../src/modules/verification/domain/policies/StudentVerificationPolicy.js";

describe("Student Verification Domain Module Use Cases & Policies", () => {
    let mockRepo;

    beforeEach(() => {
        mockRepo = {
            findById: jest.fn(),
            findByUserId: jest.fn(),
            findPendingByUserId: jest.fn(),
            create: jest.fn(),
            updateStatus: jest.fn(),
            findRequests: jest.fn(),
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("StudentVerificationPolicy should evaluate owner user and review authorization", () => {
        const req = { _id: "req123", userId: { _id: "user123" } };
        expect(StudentVerificationPolicy.isOwnerUser(req, "user123")).toBe(true);
        expect(StudentVerificationPolicy.canReview({ role: "ADMIN" })).toBe(true);
        expect(StudentVerificationPolicy.canReview({ role: "STUDENT" })).toBe(false);

        expect(StudentVerificationPolicy.isValidStatusTransition("PENDING", "APPROVED")).toBe(true);
        expect(StudentVerificationPolicy.isValidStatusTransition("APPROVED", "REJECTED")).toBe(false);
    });

    it("SubmitStudentVerificationUseCase should create verification request when valid", async () => {
        mockRepo.findPendingByUserId.mockResolvedValue(null);
        mockRepo.create.mockResolvedValue({ _id: "req123", status: "PENDING" });

        const useCase = new SubmitStudentVerificationUseCase(mockRepo);
        const result = await useCase.execute("user123", {
            applicantType: "STUDENT",
            studentProfileId: "profile123",
        });

        expect(result.status).toBe("PENDING");
        expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ applicantType: "STUDENT" }));
    });

    it("SubmitStudentVerificationUseCase should reject if pending request exists", async () => {
        mockRepo.findPendingByUserId.mockResolvedValue({ _id: "req123", status: "PENDING" });

        const useCase = new SubmitStudentVerificationUseCase(mockRepo);
        await expect(
            useCase.execute("user123", { applicantType: "STUDENT", studentProfileId: "profile123" })
        ).rejects.toThrow("You already have a pending verification request");
    });

    it("GetStudentVerificationStatusUseCase should return user request status", async () => {
        mockRepo.findByUserId.mockResolvedValue({ _id: "req123", status: "PENDING" });

        const useCase = new GetStudentVerificationStatusUseCase(mockRepo);
        const result = await useCase.execute("user123");

        expect(result.status).toBe("PENDING");
        expect(mockRepo.findByUserId).toHaveBeenCalledWith("user123");
    });

    it("ReviewStudentVerificationUseCase should approve request when authorized by ADMIN", async () => {
        mockRepo.findById.mockResolvedValue({ _id: "req123", status: "PENDING" });
        mockRepo.updateStatus.mockResolvedValue({ _id: "req123", status: "APPROVED" });

        const useCase = new ReviewStudentVerificationUseCase(mockRepo);
        const result = await useCase.execute(
            { _id: "admin123", role: "ADMIN" },
            "req123",
            { targetStatus: "APPROVED", adminNotes: "All documents valid" }
        );

        expect(result.status).toBe("APPROVED");
        expect(mockRepo.updateStatus).toHaveBeenCalledWith("req123", expect.objectContaining({ status: "APPROVED" }));
    });
});
