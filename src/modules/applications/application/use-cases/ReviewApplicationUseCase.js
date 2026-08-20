import { AppError } from "../../../../shared/errors/AppError.js";
import ApplicationPolicy from "../../domain/policies/ApplicationPolicy.js";

export class ReviewApplicationUseCase {
    constructor(applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    async execute(user, applicationId, { status, offerLetterUrl }) {
        if (!applicationId) {
            throw new AppError(400, "Invalid application ID");
        }
        if (!status) {
            throw new AppError(400, "Status is required");
        }

        if (!["SHORTLISTED", "OFFER", "REJECTED"].includes(status)) {
            throw new AppError(400, "Status must be SHORTLISTED, OFFER, or REJECTED");
        }

        if (status === "OFFER" && !offerLetterUrl) {
            throw new AppError(400, "Offer letter URL is required when status is OFFER");
        }

        const application = await this.applicationRepository.findById(applicationId);
        if (!application) {
            throw new AppError(404, "Application not found");
        }

        if (!ApplicationPolicy.canReviewApplication(user, application.job?.company)) {
            throw new AppError(403, "You are not authorized to review this application");
        }

        const updateFields = {
            status,
            reviewedBy: user._id,
        };

        if (status === "OFFER") {
            updateFields.offerLetterUrl = offerLetterUrl;
        }

        const updatedApplication = await this.applicationRepository.update(applicationId, updateFields);

        return updatedApplication;
    }
}

export default ReviewApplicationUseCase;
