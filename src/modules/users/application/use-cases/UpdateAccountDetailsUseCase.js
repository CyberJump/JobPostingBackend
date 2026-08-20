import { AppError } from "../../../../shared/errors/AppError.js";
import UserPolicy from "../../domain/policies/UserPolicy.js";

export class UpdateAccountDetailsUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userId, updatePayload) {
        if (!userId) {
            throw new AppError(401, "Authentication required");
        }

        const sanitized = UserPolicy.sanitizeUpdateFields(updatePayload);
        if (Object.keys(sanitized).length === 0) {
            throw new AppError(400, "At least one valid field is required to update");
        }

        const updatedUser = await this.userRepository.updateAccountDetails(userId, sanitized);
        if (!updatedUser) {
            throw new AppError(404, "User not found or update failed");
        }

        return updatedUser;
    }
}

export default UpdateAccountDetailsUseCase;
