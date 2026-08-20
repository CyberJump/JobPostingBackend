import { AppError } from "../../../../shared/errors/AppError.js";
import ApplicationPolicy from "../../domain/policies/ApplicationPolicy.js";

export class GetApplicationUseCase {
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

        if (application.company?.status === "BLOCKED") {
            throw new AppError(404, "Application not found");
        }

        if (!ApplicationPolicy.isOwnerStudent(application, userId)) {
            throw new AppError(403, "You are not authorized to view this application");
        }

        return application;
    }
}

export default GetApplicationUseCase;
