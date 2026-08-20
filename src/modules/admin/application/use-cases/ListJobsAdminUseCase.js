import { AppError } from "../../../../shared/errors/AppError.js";
import mongoose from "mongoose";

export class ListJobsAdminUseCase {
    constructor(moderationRepository) {
        this.moderationRepository = moderationRepository;
    }

    async execute({ page = 1, limit = 20, status, jobType, companyId }) {
        const matchStage = {};

        if (status) {
            if (!["ACTIVE", "INACTIVE"].includes(status)) {
                throw new AppError(400, "Invalid status");
            }
            matchStage.status = status;
        }

        if (jobType) {
            if (!["FULLTIME", "INTERNSHIP"].includes(jobType)) {
                throw new AppError(400, "Invalid job type");
            }
            matchStage.jobType = jobType;
        }

        if (companyId) {
            if (!mongoose.isValidObjectId(companyId)) {
                throw new AppError(400, "Invalid company ID");
            }
            matchStage.company = new mongoose.Types.ObjectId(companyId);
        }

        return await this.moderationRepository.findJobs(matchStage, { page, limit });
    }
}

export default ListJobsAdminUseCase;
