import { AppError } from "../../../../shared/errors/AppError.js";
import cacheService from "../../../../infrastructure/cache/cache.service.js";
import redisKeys from "../../../../infrastructure/redis/redis.keys.js";

export class GetJobUseCase {
    constructor(jobRepository) {
        this.jobRepository = jobRepository;
    }

    async execute(jobId) {
        if (!jobId) {
            throw new AppError(400, "Job ID is required");
        }

        const cacheKey = redisKeys.cacheJob(jobId);
        const cachedJob = await cacheService.get(cacheKey);
        if (cachedJob) {
            return cachedJob;
        }

        const job = await this.jobRepository.findById(jobId);
        if (!job) {
            throw new AppError(404, "Job posting not found");
        }

        if (job.company?.status === "BLOCKED") {
            throw new AppError(404, "Job posting not found");
        }

        await cacheService.set(cacheKey, job, 300);
        return job;
    }
}

export default GetJobUseCase;
