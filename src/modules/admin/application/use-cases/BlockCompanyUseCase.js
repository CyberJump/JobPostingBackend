import { AppError } from "../../../../shared/errors/AppError.js";

export class BlockCompanyUseCase {
    constructor(moderationRepository) {
        this.moderationRepository = moderationRepository;
    }

    async execute(actorUser, companyId) {
        if (!companyId) {
            throw new AppError(400, "Invalid company ID");
        }

        const blockedCompany = await this.moderationRepository.updateCompanyStatus(companyId, "BLOCKED", actorUser._id);
        if (!blockedCompany) {
            throw new AppError(404, "Company not found");
        }

        return blockedCompany;
    }
}

export default BlockCompanyUseCase;
