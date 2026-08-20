export class ICompanyRepository {
    async findById(id) {
        throw new Error("Method findById() must be implemented");
    }

    async findByEmail(email) {
        throw new Error("Method findByEmail() must be implemented");
    }

    async create(companyData) {
        throw new Error("Method create() must be implemented");
    }

    async update(id, updateFields) {
        throw new Error("Method update() must be implemented");
    }

    async delete(id) {
        throw new Error("Method delete() must be implemented");
    }

    async findAll(options) {
        throw new Error("Method findAll() must be implemented");
    }

    async findMyCompanies(userId, options) {
        throw new Error("Method findMyCompanies() must be implemented");
    }
}

export default ICompanyRepository;
