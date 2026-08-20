import { AppError } from "../../../../shared/errors/AppError.js";
import StudentVerificationPolicy from "../../domain/policies/StudentVerificationPolicy.js";

export class ReviewStudentVerificationUseCase {
    constructor(verificationRepository) {
        this.verificationRepository = verificationRepository;
    }

    async execute(reviewerUser, requestId, { targetStatus, adminNotes }) {
        if (!StudentVerificationPolicy.canReview(reviewerUser)) {
            throw new AppError(403, "You are not authorized to review verification requests");
        }

        if (!requestId) {
            throw new AppError(400, "Invalid request ID");
        }

        const request = await this.verificationRepository.findById(requestId);
        if (!request) {
            throw new AppError(404, "Verification request not found");
        }

        if (!StudentVerificationPolicy.isValidStatusTransition(request.status, targetStatus)) {
            throw new AppError(400, "This request has already been processed");
        }

        return await this.verificationRepository.updateStatus(requestId, {
            status: targetStatus,
            adminNotes,
            reviewedBy: reviewerUser._id,
        });
    }
}

export default ReviewStudentVerificationUseCase;
