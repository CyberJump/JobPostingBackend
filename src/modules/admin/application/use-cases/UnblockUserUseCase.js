import { AppError } from "../../../../shared/errors/AppError.js";

export class UnblockUserUseCase {
    constructor(moderationRepository) {
        this.moderationRepository = moderationRepository;
    }

    async execute(actorUser, userId) {
        if (!userId) {
            throw new AppError(400, "Invalid user ID");
        }

        const unblockedUser = await this.moderationRepository.updateUserStatus(userId, "ACTIVE");
        if (!unblockedUser) {
            throw new AppError(404, "User not found");
        }

        return unblockedUser;
    }
}

export default UnblockUserUseCase;
