export class ApplicationPolicy {
    static isOwnerStudent(application, studentId) {
        if (!application || !application.student || !studentId) return false;
        const appStudentId = application.student?._id ? application.student._id.toString() : application.student?.toString();
        return appStudentId === studentId.toString();
    }

    static canWithdraw(application, studentId) {
        if (!this.isOwnerStudent(application, studentId)) return false;
        const createdAt = new Date(application.createdAt);
        const now = new Date();
        const hoursDifference = (now - createdAt) / (1000 * 60 * 60);
        return hoursDifference <= 24;
    }

    static isCompanyFounder(company, userId) {
        if (!company || !company.founders || !userId) return false;
        const targetId = userId.toString();
        return company.founders.some((founder) => {
            const founderId = founder.userId?._id ? founder.userId._id.toString() : founder.userId?.toString();
            return founderId === targetId;
        });
    }

    static canReviewApplication(user, company) {
        if (!user) return false;
        if (user.role === "ADMIN") return true;
        return this.isCompanyFounder(company, user._id);
    }
}

export default ApplicationPolicy;
