import BaseRepository from "../../../../infrastructure/database/repositories/base.repository.js";
import { Company } from "../../../../models/company.models.js";
import ICompanyRepository from "../../domain/ports/ICompanyRepository.js";
import mongoose from "mongoose";

export class MongoCompanyRepository extends BaseRepository {
    constructor() {
        super(Company);
    }

    async findById(id) {
        if (!mongoose.isValidObjectId(id)) return null;
        const company = await this.model.findById(id)
            .populate("founders.userId", "name email username profilePicture")
            .populate("approvedBy", "name email")
            .exec();
        return company ? (company.toObject ? company.toObject() : company) : null;
    }

    async findByEmail(email) {
        const company = await this.model.findOne({ email }).exec();
        return company ? (company.toObject ? company.toObject() : company) : null;
    }

    async create(companyData) {
        const newCompany = await this.model.create(companyData);
        return await this.findById(newCompany._id);
    }

    async update(id, updateFields) {
        await this.model.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).exec();
        return await this.findById(id);
    }

    async delete(id) {
        return await this.model.findByIdAndDelete(id).exec();
    }

    async findAll({ page = 1, limit = 10, status, search, userRole, userId, myCompanies }) {
        const matchStage = {};

        if (userRole === "COMPANY") {
            matchStage["founders.userId"] = new mongoose.Types.ObjectId(userId);
        } else if (myCompanies === "true" && userId) {
            matchStage["founders.userId"] = new mongoose.Types.ObjectId(userId);
        }

        if (status) {
            matchStage.status = status;
        } else {
            matchStage.status = { $ne: "BLOCKED" };
        }

        if (search) {
            matchStage.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        const aggregate = this.model.aggregate([
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
            { $lookup: { from: "users", localField: "founders.userId", foreignField: "_id", as: "populatedFounders" } },
            {
                $project: {
                    name: 1,
                    email: 1,
                    description: 1,
                    website: 1,
                    Logo: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    founders: {
                        $map: {
                            input: "$founders",
                            as: "f",
                            in: {
                                userId: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$populatedFounders",
                                                as: "pf",
                                                cond: { $eq: ["$$pf._id", "$$f.userId"] },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            { $project: { "founders.userId.password": 0, "founders.userId.refreshToken": 0 } },
        ]);

        return await this.model.aggregatePaginate(aggregate, { page: parseInt(page), limit: parseInt(limit) });
    }

    async findMyCompanies(userId, { page = 1, limit = 10 }) {
        const userObjId = new mongoose.Types.ObjectId(userId);
        const matchStage = {
            "founders.userId": userObjId,
            status: { $ne: "BLOCKED" },
        };

        const aggregate = this.model.aggregate([
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
            { $lookup: { from: "users", localField: "founders.userId", foreignField: "_id", as: "populatedFounders" } },
            {
                $project: {
                    name: 1,
                    email: 1,
                    description: 1,
                    website: 1,
                    Logo: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    founders: {
                        $map: {
                            input: "$founders",
                            as: "f",
                            in: {
                                userId: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$populatedFounders",
                                                as: "pf",
                                                cond: { $eq: ["$$pf._id", "$$f.userId"] },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            { $project: { "founders.userId.password": 0, "founders.userId.refreshToken": 0 } },
        ]);

        return await this.model.aggregatePaginate(aggregate, { page: parseInt(page), limit: parseInt(limit) });
    }
}

export default MongoCompanyRepository;
