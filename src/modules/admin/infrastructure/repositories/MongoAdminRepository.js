import BaseRepository from "../../../../infrastructure/database/repositories/base.repository.js";
import { User } from "../../../../models/user.models.js";
import IAdminRepository from "../../domain/ports/IAdminRepository.js";
import mongoose from "mongoose";

export class MongoAdminRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    async findById(id) {
        if (!mongoose.isValidObjectId(id)) return null;
        const user = await this.model.findById(id).select("-password -refreshToken").exec();
        return user ? (user.toObject ? user.toObject() : user) : null;
    }

    async findByEmailOrUsername(email, username) {
        const user = await this.model.findOne({
            $or: [{ email }, { username }],
        }).exec();
        return user ? (user.toObject ? user.toObject() : user) : null;
    }

    async createAdmin({ name, username, email, password }) {
        const created = await this.model.create({
            name,
            username,
            email,
            password,
            role: "ADMIN",
            status: "ACTIVE",
        });
        return await this.findById(created._id);
    }

    async updateRole(userId, role) {
        const updated = await this.model.findByIdAndUpdate(
            userId,
            { $set: { role } },
            { new: true }
        ).select("-password -refreshToken").exec();
        return updated ? (updated.toObject ? updated.toObject() : updated) : null;
    }
}

export default MongoAdminRepository;
