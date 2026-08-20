import { AppError } from "../../../../shared/errors/AppError.js";

export class RefreshTokenUseCase {
    constructor(identityRepository, tokenProvider) {
        this.identityRepository = identityRepository;
        this.tokenProvider = tokenProvider;
    }

    async execute(incomingRefreshToken) {
        if (!incomingRefreshToken) {
            throw new AppError(401, "Refresh token is required");
        }

        try {
            const decoded = this.tokenProvider.verifyRefreshToken(incomingRefreshToken);
            const user = await this.identityRepository.findById(decoded?._id);

            if (!user) {
                throw new AppError(401, "Invalid refresh token");
            }

            if (incomingRefreshToken !== user?.refreshToken) {
                throw new AppError(401, "Refresh token is expired or used");
            }

            const accessToken = this.tokenProvider.generateAccessToken(user);
            const newRefreshToken = this.tokenProvider.generateRefreshToken(user);

            await this.identityRepository.updateRefreshToken(user._id, newRefreshToken);

            return { accessToken, refreshToken: newRefreshToken };
        } catch (err) {
            throw new AppError(401, err?.message || "Invalid refresh token");
        }
    }
}

export default RefreshTokenUseCase;
