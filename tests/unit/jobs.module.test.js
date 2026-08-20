import { jest } from "@jest/globals";
import CreateJobUseCase from "../../src/modules/jobs/application/use-cases/CreateJobUseCase.js";
import GetJobUseCase from "../../src/modules/jobs/application/use-cases/GetJobUseCase.js";
import UpdateJobUseCase from "../../src/modules/jobs/application/use-cases/UpdateJobUseCase.js";
import CloseJobUseCase from "../../src/modules/jobs/application/use-cases/CloseJobUseCase.js";
import DeleteJobUseCase from "../../src/modules/jobs/application/use-cases/DeleteJobUseCase.js";
import JobPolicy from "../../src/modules/jobs/domain/policies/JobPolicy.js";

describe("Jobs Domain Module Use Cases & Policies", () => {
    let mockJobRepo;

    beforeEach(() => {
        mockJobRepo = {
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findAll: jest.fn(),
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("JobPolicy should evaluate founder ownership and sanitize update fields", () => {
        const job = {
            _id: "job123",
            company: {
                _id: "comp123",
                founders: [{ userId: { _id: "user123" } }],
            },
        };

        expect(JobPolicy.canModifyJob({ _id: "admin1", role: "ADMIN" }, job)).toBe(true);
        expect(JobPolicy.canModifyJob({ _id: "user123", role: "COMPANY" }, job)).toBe(true);
        expect(JobPolicy.canModifyJob({ _id: "user456", role: "COMPANY" }, job)).toBe(false);

        const sanitized = JobPolicy.sanitizeUpdateFields({
            title: "Senior Backend Engineer",
            status: "INACTIVE",
            company: "hacked",
        });

        expect(sanitized.title).toBe("Senior Backend Engineer");
        expect(sanitized.status).toBeUndefined();
        expect(sanitized.company).toBeUndefined();
    });

    it("CreateJobUseCase should create job posting with active status", async () => {
        mockJobRepo.create.mockResolvedValue({ _id: "job123", title: "Backend Dev", status: "ACTIVE" });

        const useCase = new CreateJobUseCase(mockJobRepo);
        const result = await useCase.execute("user123", {
            title: "Backend Dev",
            company: "comp123",
            description: "Build robust Node.js APIs",
            requirements: ["Node.js", "Express"],
            location: "Remote",
            salary: "120000",
            jobType: "FULLTIME",
        });

        expect(result._id).toBe("job123");
        expect(mockJobRepo.create).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Backend Dev",
                company: "comp123",
                createdBy: "user123",
                status: "ACTIVE",
            })
        );
    });

    it("GetJobUseCase should return job details", async () => {
        mockJobRepo.findById.mockResolvedValue({ _id: "job123", title: "Backend Dev", company: { status: "ACTIVE" } });

        const useCase = new GetJobUseCase(mockJobRepo);
        const result = await useCase.execute("job123");

        expect(result.title).toBe("Backend Dev");
        expect(mockJobRepo.findById).toHaveBeenCalledWith("job123");
    });

    it("UpdateJobUseCase should update job when authorized", async () => {
        const job = { _id: "job123", title: "Old Title", company: { founders: [{ userId: "user123" }] } };
        mockJobRepo.findById.mockResolvedValue(job);
        mockJobRepo.update.mockResolvedValue({ _id: "job123", title: "New Title" });

        const useCase = new UpdateJobUseCase(mockJobRepo);
        const result = await useCase.execute(
            { _id: "user123", role: "COMPANY" },
            "job123",
            { title: "New Title" }
        );

        expect(result.title).toBe("New Title");
        expect(mockJobRepo.update).toHaveBeenCalledWith("job123", { title: "New Title" });
    });

    it("CloseJobUseCase should update job status to INACTIVE", async () => {
        const job = { _id: "job123", company: { founders: [{ userId: "user123" }] } };
        mockJobRepo.findById.mockResolvedValue(job);
        mockJobRepo.update.mockResolvedValue({ _id: "job123", status: "INACTIVE" });

        const useCase = new CloseJobUseCase(mockJobRepo);
        const result = await useCase.execute({ _id: "user123", role: "COMPANY" }, "job123");

        expect(result.status).toBe("INACTIVE");
        expect(mockJobRepo.update).toHaveBeenCalledWith("job123", { status: "INACTIVE" });
    });

    it("DeleteJobUseCase should delete job when authorized", async () => {
        const job = { _id: "job123", company: { founders: [{ userId: "user123" }] } };
        mockJobRepo.findById.mockResolvedValue(job);
        mockJobRepo.delete.mockResolvedValue({ _id: "job123" });

        const useCase = new DeleteJobUseCase(mockJobRepo);
        const result = await useCase.execute({ _id: "user123", role: "COMPANY" }, "job123");

        expect(result.success).toBe(true);
        expect(mockJobRepo.delete).toHaveBeenCalledWith("job123");
    });
});
