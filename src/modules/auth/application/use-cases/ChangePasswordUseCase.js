import { AppError } from "../../../../shared/errors/AppError.js";

export class ChangePasswordUseCase {
    constructor(identityRepository) {
        this.identityRepository = identityRepository;
    }

    async execute(userId, { oldPassword, newPassword }) {
        if (!oldPassword || !newPassword) {
            throw new AppError(400, "All fields are required");
        }

        const user = await this.identityRepository.findById(userId);
        if (!user) {
            throw new AppError(404, "User not found");
        }

        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
        if (!isPasswordCorrect) {
            throw new AppError(400, "Invalid old password");
        }

        await this.identityRepository.updatePassword(userId, newPassword);
        return { success: true };
    }
}

export default ChangePasswordUseCase;
