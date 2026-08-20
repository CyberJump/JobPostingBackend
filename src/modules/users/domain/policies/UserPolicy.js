export class UserPolicy {
    static canUpdateProfile(authenticatedUserId, targetUserId) {
        if (!authenticatedUserId || !targetUserId) return false;
        return authenticatedUserId.toString() === targetUserId.toString();
    }

    static sanitizeUpdateFields(fields) {
        const allowed = ["name", "email", "username"];
        const sanitized = {};
        for (const key of Object.keys(fields)) {
            if (allowed.includes(key) && fields[key] !== undefined) {
                sanitized[key] = fields[key];
            }
        }
        return sanitized;
    }
}

export default UserPolicy;
