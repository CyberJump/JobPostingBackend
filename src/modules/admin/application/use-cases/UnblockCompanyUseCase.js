import { AppError } from "../../../../shared/errors/AppError.js";

export class UnblockCompanyUseCase {
    constructor(moderationRepository) {
        this.moderationRepository = moderationRepository;
    }

    async execute(actorUser, companyId) {
        if (!companyId) {
            throw new AppError(400, "Invalid company ID");
        }

        const unblockedCompany = await this.moderationRepository.updateCompanyStatus(companyId, "ACTIVE", actorUser._id);
        if (!unblockedCompany) {
            throw new AppError(404, "Company not found");
        }

        return unblockedCompany;
    }
}

export default UnblockCompanyUseCase;
