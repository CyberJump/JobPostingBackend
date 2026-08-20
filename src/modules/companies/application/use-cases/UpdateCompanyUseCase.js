import { AppError } from "../../../../shared/errors/AppError.js";
import CompanyPolicy from "../../domain/policies/CompanyPolicy.js";
import storagePort from "../../../../infrastructure/storage/storage.port.js";
import cacheService from "../../../../infrastructure/cache/cache.service.js";
import redisKeys from "../../../../infrastructure/redis/redis.keys.js";

export class UpdateCompanyUseCase {
    constructor(companyRepository) {
        this.companyRepository = companyRepository;
    }

    async execute(user, companyId, updatePayload, logoFilePath) {
        if (!companyId) {
            throw new AppError(400, "Company ID is required");
        }

        const existingCompany = await this.companyRepository.findById(companyId);
        if (!existingCompany) {
            throw new AppError(404, "Company not found");
        }

        if (!CompanyPolicy.canModifyCompany(user, existingCompany)) {
            throw new AppError(403, "You are not authorized to update this company");
        }

        let Logo = updatePayload.Logo;
        if (logoFilePath) {
            const uploaded = await storagePort.uploadFile(logoFilePath);
            if (uploaded) {
                if (existingCompany.Logo && existingCompany.Logo.includes("cloudinary.com")) {
                    await storagePort.deleteFile(existingCompany.Logo, "image");
                }
                Logo = uploaded.url;
            }
        }

        const updateFields = CompanyPolicy.sanitizeUpdateFields(updatePayload);
        if (Logo !== undefined) updateFields.Logo = Logo;

        if (updatePayload.email && updatePayload.email !== existingCompany.email) {
            const emailTaken = await this.companyRepository.findByEmail(updatePayload.email);
            if (emailTaken) {
                throw new AppError(400, "Company with this email already exists");
            }
            updateFields.email = updatePayload.email;
        }

        const updatedCompany = await this.companyRepository.update(companyId, updateFields);

        // Invalidate profile cache
        await cacheService.delete(redisKeys.cacheCompany(companyId));

        return updatedCompany;
    }
}

export default UpdateCompanyUseCase;
