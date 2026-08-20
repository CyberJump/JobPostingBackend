import { AppError } from "../../../../shared/errors/AppError.js";

export class LoginUserUseCase {
    constructor(identityRepository, tokenProvider) {
        this.identityRepository = identityRepository;
        this.tokenProvider = tokenProvider;
    }

    async execute({ email, password }) {
        if (!email || !password) {
            throw new AppError(400, "All fields are required");
        }

        const user = await this.identityRepository.findByEmail(email);
        if (!user) {
            throw new AppError(400, "User not found");
        }

        const isPasswordCorrect = await user.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            throw new AppError(400, "Incorrect password");
        }

        const accessToken = this.tokenProvider.generateAccessToken(user);
        const refreshToken = this.tokenProvider.generateRefreshToken(user);

        await this.identityRepository.updateRefreshToken(user._id, refreshToken);

        const loggedInUser = await this.identityRepository.findById(user._id);
        const userObj = loggedInUser.toObject ? loggedInUser.toObject() : loggedInUser;
        delete userObj.password;
        delete userObj.refreshToken;

        return { user: userObj, accessToken, refreshToken };
    }
}

export default LoginUserUseCase;
