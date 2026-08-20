import { AppError } from "../../../../shared/errors/AppError.js";
import ApplicationPolicy from "../../domain/policies/ApplicationPolicy.js";
import MongoJobRepository from "../../../jobs/infrastructure/repositories/MongoJobRepository.js";

const jobRepo = new MongoJobRepository();

export class ListCompanyApplicationsUseCase {
    constructor(applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    async execute(user, jobId, { page = 1, limit = 10, status }) {
        if (!jobId) {
            throw new AppError(400, "Invalid job ID");
        }

        const job = await jobRepo.findById(jobId);
        if (!job) {
            throw new AppError(404, "Job not found");
        }

        if (!ApplicationPolicy.canReviewApplication(user, job.company)) {
            throw new AppError(403, "You are not authorized to view applications for this job");
        }

        if (status && !["APPLIED", "SHORTLISTED", "OFFER", "REJECTED"].includes(status)) {
            throw new AppError(400, "Invalid status. Must be APPLIED, SHORTLISTED, OFFER, or REJECTED");
        }

        return await this.applicationRepository.findJobApplications(jobId, { page, limit, status });
    }
}

export default ListCompanyApplicationsUseCase;
