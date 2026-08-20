export class IStudentVerificationRepository {
    async findById(id) {
        throw new Error("Method findById() must be implemented");
    }

    async findByUserId(userId) {
        throw new Error("Method findByUserId() must be implemented");
    }

    async findPendingByUserId(userId) {
        throw new Error("Method findPendingByUserId() must be implemented");
    }

    async create(data) {
        throw new Error("Method create() must be implemented");
    }

    async updateStatus(id, updateData) {
        throw new Error("Method updateStatus() must be implemented");
    }

    async findRequests(query, options) {
        throw new Error("Method findRequests() must be implemented");
    }
}

export default IStudentVerificationRepository;
