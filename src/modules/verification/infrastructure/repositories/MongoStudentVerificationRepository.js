import BaseRepository from "../../../../infrastructure/database/repositories/base.repository.js";
import { VerificationApplication } from "../../../../models/verificationApplication.models.js";
import { Student } from "../../../../models/student.models.js";
import { Company } from "../../../../models/company.models.js";
import { User } from "../../../../models/user.models.js";
import IStudentVerificationRepository from "../../domain/ports/IStudentVerificationRepository.js";
import mongoose from "mongoose";

export class MongoStudentVerificationRepository extends BaseRepository {
    constructor() {
        super(VerificationApplication);
    }

    async findById(id) {
        if (!mongoose.isValidObjectId(id)) return null;
        const req = await this.model.findById(id)
            .populate("userId", "name email username profilePicture")
            .populate("studentProfileId")
            .populate("companyId")
            .populate("reviewedBy", "name email")
            .exec();
        return req ? (req.toObject ? req.toObject() : req) : null;
    }

    async findByUserId(userId) {
        if (!mongoose.isValidObjectId(userId)) return null;
        const req = await this.model.findOne({ userId })
            .populate("userId", "name email username profilePicture")
            .populate("studentProfileId")
            .populate("companyId")
            .populate("reviewedBy", "name email")
            .sort({ createdAt: -1 })
            .exec();
        return req ? (req.toObject ? req.toObject() : req) : null;
    }

    async findPendingByUserId(userId) {
        if (!mongoose.isValidObjectId(userId)) return null;
        const req = await this.model.findOne({ userId, status: "PENDING" }).exec();
        return req ? (req.toObject ? req.toObject() : req) : null;
    }

    async create(data) {
        const created = await this.model.create(data);
        return await this.findById(created._id);
    }

    async updateStatus(id, { status, adminNotes, reviewedBy }) {
        const updated = await this.model.findByIdAndUpdate(
            id,
            {
                $set: {
                    status,
                    adminNotes: adminNotes || undefined,
                    reviewedBy,
                    reviewedAt: new Date(),
                },
            },
            { new: true }
        ).exec();

        if (updated) {
            if (updated.userId) {
                const uId = updated.userId._id || updated.userId;
                if (status === "APPROVED") {
                    await User.findByIdAndUpdate(uId, {
                        $set: { status: "ACTIVE", isVerified: true },
                    }).exec();
                }
            }

            if (updated.applicantType === "STUDENT" && updated.studentProfileId) {
                const studentStatus = status === "APPROVED" ? "VERIFIED" : "REJECTED";
                await Student.findByIdAndUpdate(updated.studentProfileId, {
                    status: studentStatus,
                    approvedBy: status === "APPROVED" ? reviewedBy : undefined,
                }).exec();
            } else if (updated.applicantType === "COMPANY" && updated.companyId) {
                const companyStatus = status === "APPROVED" ? "ACTIVE" : "BLOCKED";
                await Company.findByIdAndUpdate(updated.companyId, {
                    status: companyStatus,
                    approvedBy: status === "APPROVED" ? reviewedBy : undefined,
                }).exec();
            }
        }

        return await this.findById(id);
    }

    async findRequests(query = {}, { page = 1, limit = 20 } = {}) {
        const requests = await this.model.find(query)
            .populate("userId", "name email username profilePicture")
            .populate({
                path: "studentProfileId",
                populate: { path: "userId", select: "name email" },
            })
            .populate("companyId")
            .populate("reviewedBy", "name email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .exec();

        const total = await this.model.countDocuments(query);

        return {
            requests: requests.map((r) => (r.toObject ? r.toObject() : r)),
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRequests: total,
            },
        };
    }
}

export default MongoStudentVerificationRepository;
