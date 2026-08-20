import BaseRepository from "../../../../infrastructure/database/repositories/base.repository.js";
import { User } from "../../../../models/user.models.js";
import { Company } from "../../../../models/company.models.js";
import { Job } from "../../../../models/job.models.js";
import { Application } from "../../../../models/application.models.js";
import IModerationRepository from "../../domain/ports/IModerationRepository.js";
import mongoose from "mongoose";

export class MongoModerationRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    async findUserById(userId) {
        if (!mongoose.isValidObjectId(userId)) return null;
        const user = await User.findById(userId).exec();
        return user ? (user.toObject ? user.toObject() : user) : null;
    }

    async updateUserStatus(userId, status) {
        const updated = await User.findByIdAndUpdate(
            userId,
            { $set: { status } },
            { new: true }
        ).select("-password -refreshToken").exec();
        return updated ? (updated.toObject ? updated.toObject() : updated) : null;
    }

    async verifyUser(userId) {
        if (!mongoose.isValidObjectId(userId)) return null;
        const updated = await User.findByIdAndUpdate(
            userId,
            { $set: { status: "ACTIVE", isVerified: true } },
            { new: true }
        ).select("-password -refreshToken").exec();
        return updated ? (updated.toObject ? updated.toObject() : updated) : null;
    }

    async findUsers(matchCriteria, { page = 1, limit = 20 }) {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const users = await User.find(matchCriteria)
            .select("-password -refreshToken")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .exec();

        const totalUsers = await User.countDocuments(matchCriteria);

        return {
            users: users.map((u) => (u.toObject ? u.toObject() : u)),
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalUsers / parseInt(limit)),
                totalUsers,
                usersPerPage: parseInt(limit),
            },
        };
    }

    async updateCompanyStatus(companyId, status, adminId) {
        if (!mongoose.isValidObjectId(companyId)) return null;
        const updated = await Company.findByIdAndUpdate(
            companyId,
            { $set: { status, approvedBy: adminId } },
            { new: true }
        ).populate("founders.userId", "name email username").exec();

        if (updated && status === "ACTIVE" && updated.founders) {
            for (const f of updated.founders) {
                const uId = f.userId?._id || f.userId;
                if (uId) {
                    await User.findByIdAndUpdate(uId, {
                        $set: { status: "ACTIVE", isVerified: true },
                    }).exec();
                }
            }
        }

        return updated ? (updated.toObject ? updated.toObject() : updated) : null;
    }

    async findApplications(matchStage, { page = 1, limit = 20 }) {
        const aggregate = Application.aggregate([
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "jobs",
                    localField: "job",
                    foreignField: "_id",
                    as: "job",
                },
            },
            { $unwind: { path: "$job", preserveNullAndEmptyArrays: true } },
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
                    localField: "student",
                    foreignField: "_id",
                    as: "student",
                },
            },
            { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "reviewedBy",
                    foreignField: "_id",
                    as: "reviewedBy",
                },
            },
            { $unwind: { path: "$reviewedBy", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    status: 1,
                    resumeUrl: 1,
                    offerLetterUrl: 1,
                    additionalDocuments: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    "job._id": 1,
                    "job.title": 1,
                    "job.status": 1,
                    "company._id": 1,
                    "company.name": 1,
                    "company.status": 1,
                    "student._id": 1,
                    "student.name": 1,
                    "student.email": 1,
                    "student.status": 1,
                    "reviewedBy._id": 1,
                    "reviewedBy.name": 1,
                    "reviewedBy.email": 1,
                },
            },
        ]);

        return await Application.aggregatePaginate(aggregate, { page: parseInt(page), limit: parseInt(limit) });
    }

    async deleteApplication(applicationId) {
        if (!mongoose.isValidObjectId(applicationId)) return null;
        return await Application.findByIdAndDelete(applicationId).exec();
    }

    async findJobs(matchStage, { page = 1, limit = 20 }) {
        const aggregate = Job.aggregate([
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
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
                    "company.status": 1,
                    "createdBy._id": 1,
                    "createdBy.name": 1,
                    "createdBy.email": 1,
                    "createdBy.status": 1,
                },
            },
        ]);

        return await Job.aggregatePaginate(aggregate, { page: parseInt(page), limit: parseInt(limit) });
    }

    async updateJob(jobId, updateFields) {
        if (!mongoose.isValidObjectId(jobId)) return null;
        const updated = await Job.findByIdAndUpdate(
            jobId,
            { $set: updateFields },
            { new: true }
        ).populate("company", "name email")
         .populate("createdBy", "name email username").exec();
        return updated ? (updated.toObject ? updated.toObject() : updated) : null;
    }

    async deleteJob(jobId) {
        if (!mongoose.isValidObjectId(jobId)) return null;
        return await Job.findByIdAndDelete(jobId).exec();
    }
}

export default MongoModerationRepository;
