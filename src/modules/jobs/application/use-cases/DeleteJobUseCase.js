import { AppError } from "../../../../shared/errors/AppError.js";
import JobPolicy from "../../domain/policies/JobPolicy.js";
import cacheService from "../../../../infrastructure/cache/cache.service.js";
import redisKeys from "../../../../infrastructure/redis/redis.keys.js";

export class DeleteJobUseCase {
    constructor(jobRepository) {
        this.jobRepository = jobRepository;
    }

    async execute(user, jobId) {
        if (!jobId) {
            throw new AppError(400, "Job ID is required");
        }

        const existingJob = await this.jobRepository.findById(jobId);
        if (!existingJob) {
            throw new AppError(404, "Job posting not found");
        }

        if (!JobPolicy.canModifyJob(user, existingJob)) {
            throw new AppError(403, "You are not authorized to delete this job posting");
        }

        await this.jobRepository.delete(jobId);

        await cacheService.delete(redisKeys.cacheJob(jobId));
        await cacheService.deleteByPattern("cache:jobs:list:*");

        return { success: true };
    }
}

export default DeleteJobUseCase;
