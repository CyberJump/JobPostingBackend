import { AppError } from "../../../../shared/errors/AppError.js";
import StudentVerificationPolicy from "../../domain/policies/StudentVerificationPolicy.js";

export class ListPendingVerificationsUseCase {
    constructor(verificationRepository) {
        this.verificationRepository = verificationRepository;
    }

    async execute(user, { status = "PENDING", applicantType, page = 1, limit = 20 }) {
        if (!StudentVerificationPolicy.canReview(user)) {
            throw new AppError(403, "You are not authorized to view verification requests");
        }

        const query = {};
        if (status) query.status = status;
        if (applicantType) query.applicantType = applicantType;

        return await this.verificationRepository.findRequests(query, { page, limit });
    }
}

export default ListPendingVerificationsUseCase;
