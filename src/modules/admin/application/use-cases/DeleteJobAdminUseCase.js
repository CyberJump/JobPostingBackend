import { AppError } from "../../../../shared/errors/AppError.js";

export class DeleteJobAdminUseCase {
    constructor(moderationRepository) {
        this.moderationRepository = moderationRepository;
    }

    async execute(jobId) {
        if (!jobId) {
            throw new AppError(400, "Invalid job ID");
        }

        const deleted = await this.moderationRepository.deleteJob(jobId);
        if (!deleted) {
            throw new AppError(404, "Job not found");
        }

        return {};
    }
}

export default DeleteJobAdminUseCase;
