export class IApplicationRepository {
    async findById(id) {
        throw new Error("Method findById() must be implemented");
    }

    async findByJobAndStudent(jobId, studentId) {
        throw new Error("Method findByJobAndStudent() must be implemented");
    }

    async create(applicationData) {
        throw new Error("Method create() must be implemented");
    }

    async delete(id) {
        throw new Error("Method delete() must be implemented");
    }

    async findStudentApplications(studentId, options) {
        throw new Error("Method findStudentApplications() must be implemented");
    }

    async findJobApplications(jobId, options) {
        throw new Error("Method findJobApplications() must be implemented");
    }

    async update(id, updateFields) {
        throw new Error("Method update() must be implemented");
    }
}

export default IApplicationRepository;
