export class IUserRepository {
    async findById(id) {
        throw new Error("Method findById() must be implemented");
    }

    async updateAccountDetails(id, fields) {
        throw new Error("Method updateAccountDetails() must be implemented");
    }

    async updateProfilePhoto(id, photoUrl) {
        throw new Error("Method updateProfilePhoto() must be implemented");
    }
}

export default IUserRepository;
