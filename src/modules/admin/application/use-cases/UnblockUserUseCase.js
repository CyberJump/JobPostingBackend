import { AppError } from "../../../../shared/errors/AppError.js";

export class UnblockUserUseCase {
    constructor(moderationRepository) {
        this.moderationRepository = moderationRepository;
    }

    async execute(actorUser, userId) {
        if (!userId) {
            throw new AppError(400, "Invalid user ID");
        }

        const targetUser = await this.moderationRepository.findUserById(userId);
        if (!targetUser) {
            throw new AppError(404, "User not found");
        }

        if (targetUser.status !== "BLOCKED") {
            throw new AppError(400, "User is not blocked");
        }

        return await this.moderationRepository.updateUserStatus(userId, "ACTIVE");
    }
}

export default UnblockUserUseCase;
