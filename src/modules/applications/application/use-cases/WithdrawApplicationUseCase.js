import { AppError } from "../../../../shared/errors/AppError.js";
import ApplicationPolicy from "../../domain/policies/ApplicationPolicy.js";

export class WithdrawApplicationUseCase {
    constructor(applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    async execute(userId, applicationId) {
        if (!applicationId) {
            throw new AppError(400, "Invalid application ID");
        }

        const application = await this.applicationRepository.findById(applicationId);
        if (!application) {
            throw new AppError(404, "Application not found");
        }

        if (!ApplicationPolicy.isOwnerStudent(application, userId)) {
            throw new AppError(403, "You are not authorized to delete this application");
        }

        if (!ApplicationPolicy.canWithdraw(application, userId)) {
            throw new AppError(403, "Applications can only be deleted within 24 hours of submission");
        }

        await this.applicationRepository.delete(applicationId);

        return { success: true };
    }
}

export default WithdrawApplicationUseCase;
