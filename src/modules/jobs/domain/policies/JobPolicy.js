export class JobPolicy {
    static isFounder(company, userId) {
        if (!company || !company.founders || !userId) return false;
        const targetId = userId.toString();
        return company.founders.some((founder) => {
            const founderId = founder.userId?._id ? founder.userId._id.toString() : founder.userId?.toString();
            return founderId === targetId;
        });
    }

    static canModifyJob(user, job) {
        if (!user || !job) return false;
        if (user.role === "ADMIN") return true;
        return this.isFounder(job.company, user._id);
    }

    static sanitizeUpdateFields(fields) {
        const allowed = ["title", "description", "requirements", "location", "salary", "jobType", "applicationDeadline"];
        const sanitized = {};
        for (const key of Object.keys(fields)) {
            if (allowed.includes(key) && fields[key] !== undefined) {
                sanitized[key] = fields[key];
            }
        }
        return sanitized;
    }
}

export default JobPolicy;
