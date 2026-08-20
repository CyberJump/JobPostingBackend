import BaseRepository from "../../../../infrastructure/database/repositories/base.repository.js";
import { User } from "../../../../models/user.models.js";
import IUserRepository from "../../domain/ports/IUserRepository.js";

export class MongoUserRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    async findById(id) {
        const user = await this.model.findById(id).select("-password -refreshToken").exec();
        return user ? (user.toObject ? user.toObject() : user) : null;
    }

    async updateAccountDetails(id, updateFields) {
        const user = await this.model.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true }
        ).select("-password -refreshToken").exec();
        return user ? (user.toObject ? user.toObject() : user) : null;
    }

    async updateProfilePhoto(id, photoUrl) {
        const user = await this.model.findByIdAndUpdate(
            id,
            { $set: { profilePicture: photoUrl } },
            { new: true }
        ).select("-password -refreshToken").exec();
        return user ? (user.toObject ? user.toObject() : user) : null;
    }
}

export default MongoUserRepository;
