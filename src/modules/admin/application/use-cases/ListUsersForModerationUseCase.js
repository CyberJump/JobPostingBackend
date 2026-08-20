import { AppError } from "../../../../shared/errors/AppError.js";
import ModerationPolicy from "../../domain/policies/ModerationPolicy.js";

export class ListUsersForModerationUseCase {
    constructor(moderationRepository) {
        this.moderationRepository = moderationRepository;
    }

    async execute({ page = 1, limit = 20, role, status, search }) {
        const matchCriteria = {};

        if (role) {
            if (!ModerationPolicy.isValidRole(role)) {
                throw new AppError(400, "Invalid role. Must be STUDENT, COMPANY, or ADMIN");
            }
            matchCriteria.role = role;
        }

        if (status) {
            if (!ModerationPolicy.isValidStatus(status)) {
                throw new AppError(400, "Invalid status. Must be ACTIVE or BLOCKED");
            }
            matchCriteria.status = status;
        }

        if (search) {
            matchCriteria.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { username: { $regex: search, $options: "i" } },
            ];
        }

        return await this.moderationRepository.findUsers(matchCriteria, { page, limit });
    }
}

export default ListUsersForModerationUseCase;
