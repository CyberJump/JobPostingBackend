import BaseRepository from "../../../../infrastructure/database/repositories/base.repository.js";
import { User } from "../../../../models/user.models.js";
import IIdentityRepository from "../../domain/ports/IIdentityRepository.js";

export class MongoIdentityRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    async findByEmail(email) {
        return await this.model.findOne({ email }).exec();
    }

    async findByUsername(username) {
        return await this.model.findOne({ username }).exec();
    }

    async findByEmailOrUsername(email, username) {
        return await this.model.findOne({
            $or: [{ email }, { username }],
        }).exec();
    }

    async updateRefreshToken(userId, refreshToken) {
        return await this.model.findByIdAndUpdate(
            userId,
            { $set: { refreshToken } },
            { new: true }
        ).exec();
    }

    async updatePassword(userId, newPassword) {
        const user = await this.model.findById(userId);
        if (!user) return null;
        user.password = newPassword; // Triggers Mongoose bcrypt pre-save hook
        return await user.save();
    }
}

export default MongoIdentityRepository;
