import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { VerificationApplication } from "../models/verificationApplication.models.js";
import { Student } from "../models/student.models.js";
import { Company } from "../models/company.models.js";
import mongoose from "mongoose";

// Create a verification request (called automatically on onboarding)
const createVerificationRequest = asynchandler(async (req, res) => {
    const { applicantType, studentProfileId, companyId } = req.body;

    // Validate applicant type
    if (!applicantType || !["STUDENT", "COMPANY"].includes(applicantType)) {
        throw new ApiError(400, "Invalid applicant type");
    }

    // Check if there's already a pending request
    const existingRequest = await VerificationApplication.findOne({
        userId: req.user._id,
        status: "PENDING"
    });

    if (existingRequest) {
        throw new ApiError(400, "You already have a pending verification request");
    }

    // Validate reference based on type
    if (applicantType === "STUDENT" && !studentProfileId) {
        throw new ApiError(400, "Student profile ID is required");
    }
    if (applicantType === "COMPANY" && !companyId) {
        throw new ApiError(400, "Company ID is required");
    }

    // Create the verification request
    const verificationRequest = await VerificationApplication.create({
        applicantType,
        userId: req.user._id,
        studentProfileId: applicantType === "STUDENT" ? studentProfileId : undefined,
        companyId: applicantType === "COMPANY" ? companyId : undefined,
        status: "PENDING"
    });

    const createdRequest = await VerificationApplication.findById(verificationRequest._id)
        .populate("userId", "name email username")
        .populate("studentProfileId")
        .populate("companyId");

    return res.status(201).json(
        new ApiResponse(201, createdRequest, "Verification request submitted successfully")
    );
});

// Get my verification request (user can check their status)
const getMyVerificationRequest = asynchandler(async (req, res) => {
    const request = await VerificationApplication.findOne({ userId: req.user._id })
        .populate("userId", "name email username")
        .populate("studentProfileId")
        .populate("companyId")
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 });

    if (!request) {
        throw new ApiError(404, "No verification request found");
    }

    return res.status(200).json(
        new ApiResponse(200, request, "Verification request fetched successfully")
    );
});

// Get all pending verification requests (admin only)
const getAllPendingRequests = asynchandler(async (req, res) => {
    const { status = "PENDING", applicantType, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (applicantType) query.applicantType = applicantType;

    const requests = await VerificationApplication.find(query)
        .populate("userId", "name email username profilePicture")
        .populate({
            path: "studentProfileId",
            populate: { path: "userId", select: "name email" }
        })
        .populate("companyId")
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const total = await VerificationApplication.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            requests,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRequests: total
            }
        }, "Verification requests fetched successfully")
    );
});

// Approve verification request (admin only)
const approveRequest = asynchandler(async (req, res) => {
    const { requestId } = req.params;
    const { adminNotes } = req.body;

    if (!mongoose.isValidObjectId(requestId)) {
        throw new ApiError(400, "Invalid request ID");
    }

    const request = await VerificationApplication.findById(requestId);

    if (!request) {
        throw new ApiError(404, "Verification request not found");
    }

    if (request.status !== "PENDING") {
        throw new ApiError(400, "This request has already been processed");
    }

    // Update the verification request
    request.status = "APPROVED";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    if (adminNotes) request.adminNotes = adminNotes;
    await request.save();

    // Update the actual entity status
    if (request.applicantType === "STUDENT" && request.studentProfileId) {
        await Student.findByIdAndUpdate(request.studentProfileId, {
            status: "VERIFIED",
            approvedBy: req.user._id
        });
    } else if (request.applicantType === "COMPANY" && request.companyId) {
        await Company.findByIdAndUpdate(request.companyId, {
            status: "ACTIVE",
            approvedBy: req.user._id
        });
    }

    const updatedRequest = await VerificationApplication.findById(requestId)
        .populate("userId", "name email username")
        .populate("studentProfileId")
        .populate("companyId")
        .populate("reviewedBy", "name email");

    return res.status(200).json(
        new ApiResponse(200, updatedRequest, "Verification request approved successfully")
    );
});

// Reject verification request (admin only)
const rejectRequest = asynchandler(async (req, res) => {
    const { requestId } = req.params;
    const { adminNotes } = req.body;

    if (!mongoose.isValidObjectId(requestId)) {
        throw new ApiError(400, "Invalid request ID");
    }

    const request = await VerificationApplication.findById(requestId);

    if (!request) {
        throw new ApiError(404, "Verification request not found");
    }

    if (request.status !== "PENDING") {
        throw new ApiError(400, "This request has already been processed");
    }

    // Update the verification request
    request.status = "REJECTED";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    if (adminNotes) request.adminNotes = adminNotes;
    await request.save();

    // Update the actual entity status
    if (request.applicantType === "STUDENT" && request.studentProfileId) {
        await Student.findByIdAndUpdate(request.studentProfileId, {
            status: "REJECTED"
        });
    } else if (request.applicantType === "COMPANY" && request.companyId) {
        await Company.findByIdAndUpdate(request.companyId, {
            status: "BLOCKED"
        });
    }

    const updatedRequest = await VerificationApplication.findById(requestId)
        .populate("userId", "name email username")
        .populate("studentProfileId")
        .populate("companyId")
        .populate("reviewedBy", "name email");

    return res.status(200).json(
        new ApiResponse(200, updatedRequest, "Verification request rejected")
    );
});

export {
    createVerificationRequest,
    getMyVerificationRequest,
    getAllPendingRequests,
    approveRequest,
    rejectRequest
};
