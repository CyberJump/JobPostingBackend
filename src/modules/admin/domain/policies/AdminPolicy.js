export class AdminPolicy {
    static isAdmin(user) {
        if (!user) return false;
        return user.role === "ADMIN";
    }

    static canRemoveAdmin(actorUser, targetUser) {
        if (!this.isAdmin(actorUser)) return false;
        if (!targetUser || targetUser.role !== "ADMIN") return false;
        const actorId = actorUser._id?.toString();
        const targetId = targetUser._id?.toString();
        return actorId !== targetId;
    }
}

export default AdminPolicy;
