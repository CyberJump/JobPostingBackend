export class ModerationPolicy {
    static canBlockUser(actorUser, targetUser) {
        if (!actorUser || actorUser.role !== "ADMIN") return false;
        if (!targetUser) return false;
        const actorId = actorUser._id?.toString();
        const targetId = targetUser._id?.toString();
        if (actorId === targetId) return false; // cannot block self
        if (targetUser.role === "ADMIN") return false; // cannot block admin users directly
        if (targetUser.status === "BLOCKED") return false; // already blocked
        return true;
    }

    static canUnblockUser(actorUser, targetUser) {
        if (!actorUser || actorUser.role !== "ADMIN") return false;
        if (!targetUser) return false;
        return targetUser.status === "BLOCKED"; // can only unblock blocked users
    }

    static canVerifyUser(actorUser, targetUser) {
        if (!actorUser || actorUser.role !== "ADMIN") return false;
        if (!targetUser) return false;
        return targetUser.status === "PENDING" || !targetUser.isVerified; // can verify pending or unverified users
    }

    static isValidRole(role) {
        return ["STUDENT", "COMPANY", "ADMIN"].includes(role);
    }

    static isValidStatus(status) {
        return ["ACTIVE", "BLOCKED", "PENDING"].includes(status);
    }
}

export default ModerationPolicy;
