import { AppError } from "../../../../shared/errors/AppError.js";

export class CreateCompanyUseCase {
    constructor(companyRepository) {
        this.companyRepository = companyRepository;
    }

    async execute(userId, { name, email, description, website, Logo }) {
        if (!userId) {
            throw new AppError(401, "Authentication required");
        }
        if (!name || !email || !description) {
            throw new AppError(400, "Name, email, and description are required");
        }

        const existing = await this.companyRepository.findByEmail(email);
        if (existing) {
            throw new AppError(400, "Company with this email already exists");
        }

        const createdCompany = await this.companyRepository.create({
            name,
            email,
            description,
            website: website || undefined,
            Logo: Logo || undefined,
            founders: [{ userId }],
            status: "PENDING",
        });

        if (!createdCompany) {
            throw new AppError(500, "Failed to register company");
        }

        return createdCompany;
    }
}

export default CreateCompanyUseCase;
