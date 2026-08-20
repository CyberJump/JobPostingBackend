export class IEmailVerificationRepository {
    async findByEmail(email) {
        throw new Error("Method findByEmail() must be implemented");
    }

    async findById(id) {
        throw new Error("Method findById() must be implemented");
    }

    async markEmailVerified(userId) {
        throw new Error("Method markEmailVerified() must be implemented");
    }
}

export default IEmailVerificationRepository;
