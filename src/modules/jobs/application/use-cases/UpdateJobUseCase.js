import { AppError } from "../../../../shared/errors/AppError.js";
import JobPolicy from "../../domain/policies/JobPolicy.js";
import cacheService from "../../../../infrastructure/cache/cache.service.js";
import redisKeys from "../../../../infrastructure/redis/redis.keys.js";

export class UpdateJobUseCase {
    constructor(jobRepository) {
        this.jobRepository = jobRepository;
    }

    async execute(user, jobId, updatePayload) {
        if (!jobId) {
            throw new AppError(400, "Job ID is required");
        }

        const existingJob = await this.jobRepository.findById(jobId);
        if (!existingJob) {
            throw new AppError(404, "Job posting not found");
        }

        if (!JobPolicy.canModifyJob(user, existingJob)) {
            throw new AppError(403, "You are not authorized to update this job posting");
        }

        const updateFields = JobPolicy.sanitizeUpdateFields(updatePayload);

        if (updatePayload.jobType) {
            if (!["FULLTIME", "INTERNSHIP"].includes(updatePayload.jobType)) {
                throw new AppError(400, "Job type must be either FULLTIME or INTERNSHIP");
            }
            updateFields.jobType = updatePayload.jobType;
        }

        if (updatePayload.requirements) {
            let requirementsArray = updatePayload.requirements;
            if (typeof updatePayload.requirements === "string") {
                requirementsArray = updatePayload.requirements.split(",").map((req) => req.trim());
            }
            updateFields.requirements = requirementsArray;
        }

        const updatedJob = await this.jobRepository.update(jobId, updateFields);

        // Invalidate detail and list cache
        await cacheService.delete(redisKeys.cacheJob(jobId));
        await cacheService.deleteByPattern("cache:jobs:list:*");

        return updatedJob;
    }
}

export default UpdateJobUseCase;
