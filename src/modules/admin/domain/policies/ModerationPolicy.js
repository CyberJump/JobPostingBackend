export class ModerationPolicy {
    static canBlockUser(actorUser, targetUser) {
        if (!actorUser || actorUser.role !== "ADMIN") return false;
        if (!targetUser) return false;
        const actorId = actorUser._id?.toString();
        const targetId = targetUser._id?.toString();
        if (actorId === targetId) return false; // cannot block self
        if (targetUser.role === "ADMIN") return false; // cannot block admin users directly
        return true;
    }

    static canUnblockUser(actorUser, targetUser) {
        if (!actorUser || actorUser.role !== "ADMIN") return false;
        return !!targetUser;
    }

    static isValidRole(role) {
        return ["STUDENT", "COMPANY", "ADMIN"].includes(role);
    }

    static isValidStatus(status) {
        return ["ACTIVE", "BLOCKED"].includes(status);
    }
}

export default ModerationPolicy;
