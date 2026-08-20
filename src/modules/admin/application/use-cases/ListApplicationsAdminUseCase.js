import { AppError } from "../../../../shared/errors/AppError.js";
import mongoose from "mongoose";

export class ListApplicationsAdminUseCase {
    constructor(moderationRepository) {
        this.moderationRepository = moderationRepository;
    }

    async execute({ page = 1, limit = 20, status, jobId, companyId }) {
        const matchStage = {};

        if (status) {
            if (!["APPLIED", "SHORTLISTED", "OFFER", "REJECTED"].includes(status)) {
                throw new AppError(400, "Invalid status");
            }
            matchStage.status = status;
        }

        if (jobId) {
            if (!mongoose.isValidObjectId(jobId)) {
                throw new AppError(400, "Invalid job ID");
            }
            matchStage.job = new mongoose.Types.ObjectId(jobId);
        }

        if (companyId) {
            if (!mongoose.isValidObjectId(companyId)) {
                throw new AppError(400, "Invalid company ID");
            }
            matchStage.company = new mongoose.Types.ObjectId(companyId);
        }

        return await this.moderationRepository.findApplications(matchStage, { page, limit });
    }
}

export default ListApplicationsAdminUseCase;
