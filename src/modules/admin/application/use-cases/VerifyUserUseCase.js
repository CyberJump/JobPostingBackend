import { AppError } from "../../../../shared/errors/AppError.js";

export class VerifyUserUseCase {
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

        if (targetUser.status === "ACTIVE") {
            throw new AppError(400, "User is already verified and active");
        }

        return await this.moderationRepository.verifyUser(userId);
    }
}

export default VerifyUserUseCase;
