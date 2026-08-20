import { AppError } from "../../../../shared/errors/AppError.js";
import AdminPolicy from "../../domain/policies/AdminPolicy.js";

export class RemoveAdminUseCase {
    constructor(adminRepository) {
        this.adminRepository = adminRepository;
    }

    async execute(actorUser, userId) {
        if (!userId) {
            throw new AppError(400, "Invalid user ID");
        }

        const targetUser = await this.adminRepository.findById(userId);
        if (!targetUser) {
            throw new AppError(404, "User not found");
        }

        if (targetUser.role !== "ADMIN") {
            throw new AppError(400, "User is not an admin");
        }

        if (!AdminPolicy.canRemoveAdmin(actorUser, targetUser)) {
            throw new AppError(400, "You cannot remove your own admin privileges");
        }

        return await this.adminRepository.updateRole(userId, "STUDENT");
    }
}

export default RemoveAdminUseCase;
