export class IIdentityRepository {
    async findById(id) {
        throw new Error("Method findById() must be implemented");
    }

    async findByEmail(email) {
        throw new Error("Method findByEmail() must be implemented");
    }

    async findByUsername(username) {
        throw new Error("Method findByUsername() must be implemented");
    }

    async findByEmailOrUsername(email, username) {
        throw new Error("Method findByEmailOrUsername() must be implemented");
    }

    async create(userData) {
        throw new Error("Method create() must be implemented");
    }

    async updateRefreshToken(userId, refreshToken) {
        throw new Error("Method updateRefreshToken() must be implemented");
    }

    async updatePassword(userId, newPasswordHash) {
        throw new Error("Method updatePassword() must be implemented");
    }
}

export default IIdentityRepository;
