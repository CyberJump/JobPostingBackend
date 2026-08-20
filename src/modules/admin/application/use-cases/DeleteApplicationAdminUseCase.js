import { AppError } from "../../../../shared/errors/AppError.js";

export class DeleteApplicationAdminUseCase {
    constructor(moderationRepository) {
        this.moderationRepository = moderationRepository;
    }

    async execute(applicationId) {
        if (!applicationId) {
            throw new AppError(400, "Invalid application ID");
        }

        const deleted = await this.moderationRepository.deleteApplication(applicationId);
        if (!deleted) {
            throw new AppError(404, "Application not found");
        }

        return {};
    }
}

export default DeleteApplicationAdminUseCase;
