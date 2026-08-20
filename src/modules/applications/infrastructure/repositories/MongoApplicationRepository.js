import BaseRepository from "../../../../infrastructure/database/repositories/base.repository.js";
import { Application } from "../../../../models/application.models.js";
import IApplicationRepository from "../../domain/ports/IApplicationRepository.js";
import mongoose from "mongoose";

export class MongoApplicationRepository extends BaseRepository {
    constructor() {
        super(Application);
    }

    async findById(id) {
        if (!mongoose.isValidObjectId(id)) return null;
        const application = await this.model.findById(id)
            .populate({
                path: "job",
                populate: {
                    path: "company",
                    populate: { path: "founders.userId", select: "name email username profilePicture" },
                },
            })
            .populate("company", "name email description website Logo status")
            .populate("student", "name email username profilePicture")
            .populate("reviewedBy", "name email username")
            .exec();
        return application ? (application.toObject ? application.toObject() : application) : null;
    }

    async findByJobAndStudent(jobId, studentId) {
        if (!mongoose.isValidObjectId(jobId) || !mongoose.isValidObjectId(studentId)) return null;
        const application = await this.model.findOne({ job: jobId, student: studentId }).exec();
        return application ? (application.toObject ? application.toObject() : application) : null;
    }

    async create(applicationData) {
        const newApp = await this.model.create(applicationData);
        return await this.findById(newApp._id);
    }

    async update(id, updateFields) {
        await this.model.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).exec();
        return await this.findById(id);
    }

    async delete(id) {
        return await this.model.findByIdAndDelete(id).exec();
    }

    async findStudentApplications(studentId, { page = 1, limit = 10, status }) {
        const studentObjId = new mongoose.Types.ObjectId(studentId);
        const matchStage = { student: studentObjId };

        if (status) {
            matchStage.status = status;
        }

        const aggregate = this.model.aggregate([
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
                $match: {
                    "company.status": { $ne: "BLOCKED" },
                },
            },
            {
                $project: {
                    status: 1,
                    resumeUrl: 1,
                    additionalDocuments: 1,
                    offerLetterUrl: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    "job._id": 1,
                    "job.title": 1,
                    "job.location": 1,
                    "job.salary": 1,
                    "job.jobType": 1,
                    "job.status": 1,
                    "company._id": 1,
                    "company.name": 1,
                    "company.email": 1,
                    "company.Logo": 1,
                },
            },
        ]);

        return await this.model.aggregatePaginate(aggregate, { page: parseInt(page), limit: parseInt(limit) });
    }

    async findJobApplications(jobId, { page = 1, limit = 10, status }) {
        const jobObjId = new mongoose.Types.ObjectId(jobId);
        const matchStage = { job: jobObjId };

        if (status) {
            matchStage.status = status;
        }

        const aggregate = this.model.aggregate([
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
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
                    additionalDocuments: 1,
                    offerLetterUrl: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    "student._id": 1,
                    "student.name": 1,
                    "student.email": 1,
                    "student.username": 1,
                    "student.profilePicture": 1,
                    "reviewedBy._id": 1,
                    "reviewedBy.name": 1,
                    "reviewedBy.email": 1,
                },
            },
        ]);

        return await this.model.aggregatePaginate(aggregate, { page: parseInt(page), limit: parseInt(limit) });
    }
}

export default MongoApplicationRepository;
