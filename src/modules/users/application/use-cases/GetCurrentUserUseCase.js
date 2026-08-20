import { AppError } from "../../../../shared/errors/AppError.js";

export class GetCurrentUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userId) {
        if (!userId) {
            throw new AppError(401, "Authentication required");
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError(404, "User not found");
        }

        return user;
    }
}

export default GetCurrentUserUseCase;
