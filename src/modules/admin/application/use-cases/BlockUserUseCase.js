import { AppError } from "../../../../shared/errors/AppError.js";
import ModerationPolicy from "../../domain/policies/ModerationPolicy.js";

export class BlockUserUseCase {
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

        if (actorUser._id.toString() === userId.toString()) {
            throw new AppError(400, "You cannot block yourself");
        }

        if (targetUser.status === "PENDING") {
            throw new AppError(400, "Cannot block a pending user. User must be verified and active first.");
        }

        if (targetUser.status === "BLOCKED") {
            throw new AppError(400, "User is already blocked");
        }

        if (!ModerationPolicy.canBlockUser(actorUser, targetUser)) {
            throw new AppError(400, "Cannot block admin users. Remove admin privileges first.");
        }

        return await this.moderationRepository.updateUserStatus(userId, "BLOCKED");
    }
}

export default BlockUserUseCase;
