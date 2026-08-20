export class CompanyPolicy {
    static isFounder(company, userId) {
        if (!company || !company.founders || !userId) return false;
        const targetId = userId.toString();
        return company.founders.some((founder) => {
            const founderId = founder.userId?._id ? founder.userId._id.toString() : founder.userId?.toString();
            return founderId === targetId;
        });
    }

    static canModifyCompany(user, company) {
        if (!user || !company) return false;
        if (user.role === "ADMIN") return true;
        return this.isFounder(company, user._id);
    }

    static sanitizeUpdateFields(fields) {
        const allowed = ["name", "email", "description", "website", "Logo"];
        const sanitized = {};
        for (const key of Object.keys(fields)) {
            if (allowed.includes(key) && fields[key] !== undefined) {
                sanitized[key] = fields[key];
            }
        }
        return sanitized;
    }
}

export default CompanyPolicy;
