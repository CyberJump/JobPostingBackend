export class IJobRepository {
    async findById(id) {
        throw new Error("Method findById() must be implemented");
    }

    async create(jobData) {
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
}

export default IJobRepository;
