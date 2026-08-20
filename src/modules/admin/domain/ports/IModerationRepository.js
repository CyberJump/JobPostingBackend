export class IModerationRepository {
    async findUserById(userId) {
        throw new Error("Method findUserById() must be implemented");
    }

    async updateUserStatus(userId, status) {
        throw new Error("Method updateUserStatus() must be implemented");
    }

    async findUsers(query, options) {
        throw new Error("Method findUsers() must be implemented");
    }

    async updateCompanyStatus(companyId, status, adminId) {
        throw new Error("Method updateCompanyStatus() must be implemented");
    }

    async findApplications(query, options) {
        throw new Error("Method findApplications() must be implemented");
    }

    async deleteApplication(applicationId) {
        throw new Error("Method deleteApplication() must be implemented");
    }

    async findJobs(query, options) {
        throw new Error("Method findJobs() must be implemented");
    }

    async updateJob(jobId, updateFields) {
        throw new Error("Method updateJob() must be implemented");
    }

    async deleteJob(jobId) {
        throw new Error("Method deleteJob() must be implemented");
    }
}

export default IModerationRepository;
