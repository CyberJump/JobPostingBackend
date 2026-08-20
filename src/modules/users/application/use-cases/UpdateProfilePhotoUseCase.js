import { AppError } from "../../../../shared/errors/AppError.js";
import storagePort from "../../../../infrastructure/storage/storage.port.js";

export class UpdateProfilePhotoUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userId, profileImagePath) {
        if (!userId) {
            throw new AppError(401, "Authentication required");
        }
        if (!profileImagePath) {
            throw new AppError(400, "Profile image file is required");
        }

        const uploaded = await storagePort.uploadFile(profileImagePath);
        if (!uploaded) {
            throw new AppError(500, "Failed to upload profile image");
        }

        const existingUser = await this.userRepository.findById(userId);
        const oldPhotoUrl = existingUser?.profilePicture;

        const updatedUser = await this.userRepository.updateProfilePhoto(userId, uploaded.url);
        if (!updatedUser) {
            throw new AppError(500, "Failed to update profile photo reference in database");
        }

        // Cleanup old photo if not default avatar
        if (oldPhotoUrl && !oldPhotoUrl.includes("a309ed3530e0f365781d8c2607ac4e7e")) {
            await storagePort.deleteFile(oldPhotoUrl, "image");
        }

        return updatedUser;
    }
}

export default UpdateProfilePhotoUseCase;
