import { AppError } from "../../../../shared/errors/AppError.js";
import storagePort from "../../../../infrastructure/storage/storage.port.js";
import idempotencyService from "../../../../infrastructure/idempotency/idempotency.service.js";
import MongoJobRepository from "../../../jobs/infrastructure/repositories/MongoJobRepository.js";

const jobRepo = new MongoJobRepository();

export class SubmitApplicationUseCase {
    constructor(applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    async execute(userId, { jobId, additionalDocuments }, resumeFilePath, idempotencyKey) {
        if (!userId) {
            throw new AppError(401, "Authentication required");
        }
        if (!jobId) {
            throw new AppError(400, "Job ID is required");
        }

        const scope = `application:submit:${userId}:${jobId}`;
        const key = idempotencyKey || `${userId}_${jobId}`;

        const isAcquired = await idempotencyService.acquireLock(scope, key, 60);
        if (!isAcquired) {
            throw new AppError(409, "Application submission is currently processing");
        }

        try {
            const job = await jobRepo.findById(jobId);
            if (!job) {
                throw new AppError(404, "Job not found");
            }

            if (job.company?.status === "BLOCKED") {
                throw new AppError(400, "This job posting is no longer available");
            }

            if (job.status !== "ACTIVE") {
                throw new AppError(400, "This job posting is no longer active");
            }

            if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
                throw new AppError(400, "Application deadline has passed");
            }

            const existingApp = await this.applicationRepository.findByJobAndStudent(jobId, userId);
            if (existingApp) {
                throw new AppError(400, "You have already applied for this job");
            }

            let resumeUrl = null;
            if (resumeFilePath) {
                const uploadResult = await storagePort.uploadFile(resumeFilePath);
                if (uploadResult) {
                    resumeUrl = uploadResult.url;
                }
            }

            const createdApp = await this.applicationRepository.create({
                job: jobId,
                student: userId,
                company: job.company._id,
                resumeUrl: resumeUrl || undefined,
                additionalDocuments: additionalDocuments || [],
                status: "APPLIED",
            });

            await idempotencyService.saveResult(scope, key, createdApp, 3600);
            return createdApp;
        } catch (error) {
            await idempotencyService.releaseLock(scope, key);
            throw error;
        }
    }
}

export default SubmitApplicationUseCase;
