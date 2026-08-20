import { AppError } from "../../../../shared/errors/AppError.js";
import cacheService from "../../../../infrastructure/cache/cache.service.js";
import redisKeys from "../../../../infrastructure/redis/redis.keys.js";

export class GetCompanyUseCase {
    constructor(companyRepository) {
        this.companyRepository = companyRepository;
    }

    async execute(companyId) {
        if (!companyId) {
            throw new AppError(400, "Company ID is required");
        }

        const cacheKey = redisKeys.cacheCompany(companyId);
        const cachedCompany = await cacheService.get(cacheKey);
        if (cachedCompany) {
            return cachedCompany;
        }

        const company = await this.companyRepository.findById(companyId);
        if (!company || company.status === "BLOCKED") {
            throw new AppError(404, "Company not found");
        }

        await cacheService.set(cacheKey, company, 300);
        return company;
    }
}

export default GetCompanyUseCase;
