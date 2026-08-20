import { AppError } from "../../../../shared/errors/AppError.js";

export class ListStudentApplicationsUseCase {
    constructor(applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    async execute(userId, { page = 1, limit = 10, status }) {
        if (!userId) {
            throw new AppError(401, "Authentication required");
        }

        if (status && !["APPLIED", "SHORTLISTED", "OFFER", "REJECTED"].includes(status)) {
            throw new AppError(400, "Invalid status. Must be APPLIED, SHORTLISTED, OFFER, or REJECTED");
        }

        return await this.applicationRepository.findStudentApplications(userId, { page, limit, status });
    }
}

export default ListStudentApplicationsUseCase;
