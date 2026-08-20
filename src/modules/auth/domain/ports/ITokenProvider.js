export class ITokenProvider {
    generateAccessToken(payload) {
        throw new Error("Method generateAccessToken() must be implemented");
    }

    generateRefreshToken(payload) {
        throw new Error("Method generateRefreshToken() must be implemented");
    }

    verifyAccessToken(token) {
        throw new Error("Method verifyAccessToken() must be implemented");
    }

    verifyRefreshToken(token) {
        throw new Error("Method verifyRefreshToken() must be implemented");
    }
}

export default ITokenProvider;
