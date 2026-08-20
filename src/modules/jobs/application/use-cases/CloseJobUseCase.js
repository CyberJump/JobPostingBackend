import { AppError } from "../../../../shared/errors/AppError.js";
import JobPolicy from "../../domain/policies/JobPolicy.js";
import cacheService from "../../../../infrastructure/cache/cache.service.js";
import redisKeys from "../../../../infrastructure/redis/redis.keys.js";

export class CloseJobUseCase {
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
            throw new AppError(403, "You are not authorized to close this job posting");
        }

        const closedJob = await this.jobRepository.update(jobId, { status: "INACTIVE" });

        await cacheService.delete(redisKeys.cacheJob(jobId));
        await cacheService.deleteByPattern("cache:jobs:list:*");

        return closedJob;
    }
}

export default CloseJobUseCase;
