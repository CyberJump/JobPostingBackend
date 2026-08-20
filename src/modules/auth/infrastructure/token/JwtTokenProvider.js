import jwt from "jsonwebtoken";
import config from "../../../../config/env.js";
import ITokenProvider from "../../domain/ports/ITokenProvider.js";

export class JwtTokenProvider extends ITokenProvider {
    generateAccessToken(payload) {
        return jwt.sign(
            {
                _id: payload._id,
                email: payload.email,
                username: payload.username,
                role: payload.role,
            },
            config.auth.accessTokenSecret,
            { expiresIn: config.auth.accessTokenExpiry }
        );
    }

    generateRefreshToken(payload) {
        return jwt.sign(
            { _id: payload._id },
            config.auth.refreshTokenSecret,
            { expiresIn: config.auth.refreshTokenExpiry }
        );
    }

    verifyAccessToken(token) {
        return jwt.verify(token, config.auth.accessTokenSecret);
    }

    verifyRefreshToken(token) {
        return jwt.verify(token, config.auth.refreshTokenSecret);
    }
}

export default JwtTokenProvider;
