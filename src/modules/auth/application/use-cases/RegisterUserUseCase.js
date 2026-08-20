import { AppError } from "../../../../shared/errors/AppError.js";
import storagePort from "../../../../infrastructure/storage/storage.port.js";

export class RegisterUserUseCase {
    constructor(identityRepository) {
        this.identityRepository = identityRepository;
    }

    async execute({ name, email, username, password, role, companyId, profileImagePath }) {
        if (!name || !email || !username || !password) {
            throw new AppError(400, "All fields are required");
        }

        const existingUser = await this.identityRepository.findByEmailOrUsername(email, username);
        if (existingUser) {
            throw new AppError(400, "User with email or username already exists");
        }

        let profileImageUrl = "https://res.cloudinary.com/djgacxxqf/image/upload/v1768371178/a309ed3530e0f365781d8c2607ac4e7e_xs8f5m.jpg";
        if (profileImagePath) {
            const uploaded = await storagePort.uploadFile(profileImagePath);
            if (!uploaded) {
                throw new AppError(500, "Failed to upload profile image");
            }
            profileImageUrl = uploaded.url;
        }

        const newUser = await this.identityRepository.create({
            name,
            email,
            username,
            password,
            role: role || "STUDENT",
            profilePicture: profileImageUrl,
            status: "PENDING",
        });

        const createdUser = await this.identityRepository.findById(newUser._id);
        if (!createdUser) {
            throw new AppError(500, "Something went wrong while registering the user");
        }

        const userObj = createdUser.toObject ? createdUser.toObject() : createdUser;
        delete userObj.password;
        delete userObj.refreshToken;

        return { user: userObj, companyId };
    }
}

export default RegisterUserUseCase;
