import { AppError } from "../../../../shared/errors/AppError.js";
import cacheService from "../../../../infrastructure/cache/cache.service.js";

export class CreateJobUseCase {
    constructor(jobRepository) {
        this.jobRepository = jobRepository;
    }

    async execute(userId, { title, company, description, requirements, location, salary, jobType, applicationDeadline }) {
        if (!userId) {
            throw new AppError(401, "Authentication required");
        }
        if (!title || !company || !description || !requirements || !location || !salary || !jobType) {
            throw new AppError(400, "Title, company, description, requirements, location, salary, and job type are required");
        }

        if (!["FULLTIME", "INTERNSHIP"].includes(jobType)) {
            throw new AppError(400, "Job type must be either FULLTIME or INTERNSHIP");
        }

        let requirementsArray = requirements;
        if (typeof requirements === "string") {
            requirementsArray = requirements.split(",").map((req) => req.trim());
        }

        const createdJob = await this.jobRepository.create({
            title,
            company,
            description,
            requirements: requirementsArray,
            location,
            salary,
            jobType,
            createdBy: userId,
            applicationDeadline: applicationDeadline || undefined,
            status: "ACTIVE",
        });

        if (!createdJob) {
            throw new AppError(500, "Failed to create job posting");
        }

        // Invalidate jobs list cache
        await cacheService.deleteByPattern("cache:jobs:list:*");

        return createdJob;
    }
}

export default CreateJobUseCase;
