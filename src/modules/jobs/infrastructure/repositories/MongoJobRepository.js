import BaseRepository from "../../../../infrastructure/database/repositories/base.repository.js";
import { Job } from "../../../../models/job.models.js";
import IJobRepository from "../../domain/ports/IJobRepository.js";
import mongoose from "mongoose";

export class MongoJobRepository extends BaseRepository {
    constructor() {
        super(Job);
    }

    async findById(id) {
        if (!mongoose.isValidObjectId(id)) return null;
        const job = await this.model.findById(id)
            .populate({
                path: "company",
                populate: { path: "founders.userId", select: "name email username profilePicture" },
            })
            .populate("createdBy", "name email username")
            .exec();
        return job ? (job.toObject ? job.toObject() : job) : null;
    }

    async create(jobData) {
        const newJob = await this.model.create(jobData);
        return await this.findById(newJob._id);
    }

    async update(id, updateFields) {
        await this.model.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).exec();
        return await this.findById(id);
    }

    async delete(id) {
        return await this.model.findByIdAndDelete(id).exec();
    }

    async findAll({ page = 1, limit = 10, status, sortBy = "newest", jobType, search, includeExpired, userRole, userId }) {
        const matchStage = {};

        if (status) {
            matchStage.status = status;
        }

        if (jobType) {
            matchStage.jobType = jobType;
        }

        const currentDate = new Date();
        const effectiveRole = userRole || "STUDENT";

        if (effectiveRole === "COMPANY" && !status && !search && !jobType && userId) {
            matchStage.createdBy = new mongoose.Types.ObjectId(userId);
        }

        if (effectiveRole === "STUDENT") {
            const dateFilter = [
                { applicationDeadline: { $exists: false } },
                { applicationDeadline: null },
                { applicationDeadline: { $gte: currentDate } },
            ];
            if (search) {
                matchStage.$and = [
                    {
                        $or: [
                            { title: { $regex: search, $options: "i" } },
                            { description: { $regex: search, $options: "i" } },
                        ],
                    },
                    { $or: dateFilter },
                ];
            } else {
                matchStage.$or = dateFilter;
            }
        } else if (includeExpired !== "true") {
            const dateFilter = [
                { applicationDeadline: { $exists: false } },
                { applicationDeadline: null },
                { applicationDeadline: { $gte: currentDate } },
            ];
            if (search) {
                matchStage.$and = [
                    {
                        $or: [
                            { title: { $regex: search, $options: "i" } },
                            { description: { $regex: search, $options: "i" } },
                        ],
                    },
                    { $or: dateFilter },
                ];
            } else {
                matchStage.$or = dateFilter;
            }
        } else if (search) {
            matchStage.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        let sortStage = { createdAt: -1 };
        switch (sortBy) {
            case "newest":
                sortStage = { createdAt: -1 };
                break;
            case "oldest":
                sortStage = { createdAt: 1 };
                break;
            case "salary-high":
                sortStage = { salary: -1 };
                break;
            case "salary-low":
                sortStage = { salary: 1 };
                break;
            default:
                sortStage = { createdAt: -1 };
        }

        const aggregate = this.model.aggregate([
            { $match: matchStage },
            { $sort: sortStage },
            {
                $lookup: {
                    from: "companies",
                    localField: "company",
                    foreignField: "_id",
                    as: "company",
                },
            },
            { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "createdBy",
                },
            },
            { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    "company.status": { $ne: "BLOCKED" },
                    "createdBy.status": { $ne: "BLOCKED" },
                },
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    requirements: 1,
                    location: 1,
                    salary: 1,
                    jobType: 1,
                    status: 1,
                    applicationDeadline: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    "company._id": 1,
                    "company.name": 1,
                    "company.email": 1,
                    "company.Logo": 1,
                    "createdBy._id": 1,
                    "createdBy.name": 1,
                    "createdBy.email": 1,
                    "createdBy.username": 1,
                },
            },
        ]);

        return await this.model.aggregatePaginate(aggregate, { page: parseInt(page), limit: parseInt(limit) });
    }
}

export default MongoJobRepository;
