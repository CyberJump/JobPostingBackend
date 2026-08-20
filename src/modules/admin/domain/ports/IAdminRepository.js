export class IAdminRepository {
    async findById(id) {
        throw new Error("Method findById() must be implemented");
    }

    async findByEmailOrUsername(email, username) {
        throw new Error("Method findByEmailOrUsername() must be implemented");
    }

    async createAdmin(adminData) {
        throw new Error("Method createAdmin() must be implemented");
    }

    async updateRole(userId, role) {
        throw new Error("Method updateRole() must be implemented");
    }
}

export default IAdminRepository;
