import BaseRepository from "../../../../infrastructure/database/repositories/base.repository.js";
import { User } from "../../../../models/user.models.js";
import IEmailVerificationRepository from "../../domain/ports/IEmailVerificationRepository.js";

export class MongoEmailVerificationRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    async findByEmail(email) {
        if (!email) return null;
        const normalized = String(email).trim().toLowerCase();
        return await this.model.findOne({ email: normalized }).exec();
    }

    async findById(id) {
        return await this.model.findById(id).exec();
    }

    async markEmailVerified(userId) {
        return await this.model.findByIdAndUpdate(
            userId,
            { $set: { isVerified: true, status: "ACTIVE" } },
            { new: true }
        ).exec();
    }
}

export default MongoEmailVerificationRepository;
