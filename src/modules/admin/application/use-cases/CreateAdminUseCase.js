import { AppError } from "../../../../shared/errors/AppError.js";

export class CreateAdminUseCase {
    constructor(adminRepository) {
        this.adminRepository = adminRepository;
    }

    async execute({ name, username, email, password }) {
        if (!name || !username || !email || !password) {
            throw new AppError(400, "All fields are required");
        }

        const existingUser = await this.adminRepository.findByEmailOrUsername(email, username);
        if (existingUser) {
            throw new AppError(400, "User with this email or username already exists");
        }

        return await this.adminRepository.createAdmin({ name, username, email, password });
    }
}

export default CreateAdminUseCase;
