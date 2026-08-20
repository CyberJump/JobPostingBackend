import { AppError } from "../../../../shared/errors/AppError.js";

export class ListMyCompaniesUseCase {
    constructor(companyRepository) {
        this.companyRepository = companyRepository;
    }

    async execute(userId, { page = 1, limit = 10 }) {
        if (!userId) {
            throw new AppError(401, "Authentication required");
        }

        return await this.companyRepository.findMyCompanies(userId, { page, limit });
    }
}

export default ListMyCompaniesUseCase;
