export class StudentVerificationPolicy {
    static isOwnerUser(request, userId) {
        if (!request || !request.userId || !userId) return false;
        const requestUserId = request.userId?._id ? request.userId._id.toString() : request.userId?.toString();
        return requestUserId === userId.toString();
    }

    static canReview(user) {
        if (!user) return false;
        return user.role === "ADMIN";
    }

    static isValidStatusTransition(currentStatus, targetStatus) {
        if (currentStatus !== "PENDING") return false;
        return targetStatus === "APPROVED" || targetStatus === "REJECTED";
    }
}

export default StudentVerificationPolicy;
