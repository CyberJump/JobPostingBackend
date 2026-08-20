import { asynchandler } from "../../../../utils/asynchandler.js";
import { ApiResponse } from "../../../../utils/ApiResponse.js";
import config from "../../../../config/env.js";

import MongoIdentityRepository from "../../infrastructure/repositories/MongoIdentityRepository.js";
import JwtTokenProvider from "../../infrastructure/token/JwtTokenProvider.js";

import RegisterUserUseCase from "../../application/use-cases/RegisterUserUseCase.js";
import LoginUserUseCase from "../../application/use-cases/LoginUserUseCase.js";
import LogoutUserUseCase from "../../application/use-cases/LogoutUserUseCase.js";
import RefreshTokenUseCase from "../../application/use-cases/RefreshTokenUseCase.js";
import ChangePasswordUseCase from "../../application/use-cases/ChangePasswordUseCase.js";

const identityRepo = new MongoIdentityRepository();
const tokenProvider = new JwtTokenProvider();

const registerUserUseCase = new RegisterUserUseCase(identityRepo);
const loginUserUseCase = new LoginUserUseCase(identityRepo, tokenProvider);
const logoutUserUseCase = new LogoutUserUseCase(identityRepo);
const refreshTokenUseCase = new RefreshTokenUseCase(identityRepo, tokenProvider);
const changePasswordUseCase = new ChangePasswordUseCase(identityRepo);

const getCookieOptions = () => ({
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.env === "production" ? "None" : "Lax",
});

export const RegisterUser = asynchandler(async (req, res) => {
    const { name, email, username, password, role, companyId } = req.body;
    const profileImagePath = req.file?.path;

    const result = await registerUserUseCase.execute({
        name,
        email,
        username,
        password,
        role,
        companyId,
        profileImagePath,
    });

    return res.status(201).json(
        new ApiResponse(201, result, "User registered successfully")
    );
});

export const LoginUser = asynchandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await loginUserUseCase.execute({ email, password });

    return res.status(200)
        .cookie("accessToken", result.accessToken, getCookieOptions())
        .cookie("refreshToken", result.refreshToken, getCookieOptions())
        .json(new ApiResponse(200, result, "User logged in successfully"));
});

export const LogoutUser = asynchandler(async (req, res) => {
    const userId = req.user._id;
    await logoutUserUseCase.execute(userId);

    return res.status(200)
        .clearCookie("accessToken", getCookieOptions())
        .clearCookie("refreshToken", getCookieOptions())
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const RefreshAccessToken = asynchandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const result = await refreshTokenUseCase.execute(incomingRefreshToken);

    return res.status(200)
        .cookie("accessToken", result.accessToken, getCookieOptions())
        .cookie("refreshToken", result.refreshToken, getCookieOptions())
        .json(new ApiResponse(200, result, "Access token refreshed"));
});

export const ChangePassword = asynchandler(async (req, res) => {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;
    await changePasswordUseCase.execute(userId, { oldPassword, newPassword });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

export const GetCurrentUser = asynchandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
    );
});
