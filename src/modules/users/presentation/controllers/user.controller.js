import { asynchandler } from "../../../../utils/asynchandler.js";
import { ApiResponse } from "../../../../utils/ApiResponse.js";

import MongoUserRepository from "../../infrastructure/repositories/MongoUserRepository.js";
import GetCurrentUserUseCase from "../../application/use-cases/GetCurrentUserUseCase.js";
import UpdateAccountDetailsUseCase from "../../application/use-cases/UpdateAccountDetailsUseCase.js";
import UpdateProfilePhotoUseCase from "../../application/use-cases/UpdateProfilePhotoUseCase.js";

const userRepo = new MongoUserRepository();

const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepo);
const updateAccountDetailsUseCase = new UpdateAccountDetailsUseCase(userRepo);
const updateProfilePhotoUseCase = new UpdateProfilePhotoUseCase(userRepo);

export const GetCurrentUser = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    const user = await getCurrentUserUseCase.execute(userId);

    return res.status(200).json(
        new ApiResponse(200, user, "Current user fetched successfully")
    );
});

export const UpdateAccountDetails = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    const { name, email, username } = req.body;

    const updatedUser = await updateAccountDetailsUseCase.execute(userId, { name, email, username });

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Account details updated successfully")
    );
});

export const UpdateProfilePhoto = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    const profileImagePath = req.file?.path;

    const updatedUser = await updateProfilePhotoUseCase.execute(userId, profileImagePath);

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Profile photo updated successfully")
    );
});
