import { AppError } from "../../../../shared/errors/AppError.js";
import CompanyPolicy from "../../domain/policies/CompanyPolicy.js";
import cacheService from "../../../../infrastructure/cache/cache.service.js";
import redisKeys from "../../../../infrastructure/redis/redis.keys.js";

export class DeleteCompanyUseCase {
    constructor(companyRepository) {
        this.companyRepository = companyRepository;
    }

    async execute(user, companyId) {
        if (!companyId) {
            throw new AppError(400, "Company ID is required");
        }

        const existingCompany = await this.companyRepository.findById(companyId);
        if (!existingCompany) {
            throw new AppError(404, "Company not found");
        }

        if (!CompanyPolicy.canModifyCompany(user, existingCompany)) {
            throw new AppError(403, "You are not authorized to withdraw this company");
        }

        await this.companyRepository.delete(companyId);
        await cacheService.delete(redisKeys.cacheCompany(companyId));

        return { success: true };
    }
}

export default DeleteCompanyUseCase;
