import { asynchandler } from "../../../../utils/asynchandler.js";
import { ApiResponse } from "../../../../utils/ApiResponse.js";
import MongoStudentVerificationRepository from "../../infrastructure/repositories/MongoStudentVerificationRepository.js";
import SubmitStudentVerificationUseCase from "../../application/use-cases/SubmitStudentVerificationUseCase.js";
import GetStudentVerificationStatusUseCase from "../../application/use-cases/GetStudentVerificationStatusUseCase.js";
import ListPendingVerificationsUseCase from "../../application/use-cases/ListPendingVerificationsUseCase.js";
import ReviewStudentVerificationUseCase from "../../application/use-cases/ReviewStudentVerificationUseCase.js";

const repo = new MongoStudentVerificationRepository();
const submitUseCase = new SubmitStudentVerificationUseCase(repo);
const getStatusUseCase = new GetStudentVerificationStatusUseCase(repo);
const listPendingUseCase = new ListPendingVerificationsUseCase(repo);
const reviewUseCase = new ReviewStudentVerificationUseCase(repo);

export const createVerificationRequest = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    const { applicantType, studentProfileId, companyId } = req.body;

    const createdRequest = await submitUseCase.execute(userId, {
        applicantType,
        studentProfileId,
        companyId,
    });

    return res.status(201).json(
        new ApiResponse(201, createdRequest, "Verification request submitted successfully")
    );
});

export const getMyVerificationRequest = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    const request = await getStatusUseCase.execute(userId);

    return res.status(200).json(
        new ApiResponse(200, request, "Verification request fetched successfully")
    );
});

export const getAllPendingRequests = asynchandler(async (req, res) => {
    const { status, applicantType, page, limit } = req.query;

    const data = await listPendingUseCase.execute(req.user, {
        status,
        applicantType,
        page,
        limit,
    });

    return res.status(200).json(
        new ApiResponse(200, data, "Verification requests fetched successfully")
    );
});

export const approveRequest = asynchandler(async (req, res) => {
    const { requestId } = req.params;
    const { adminNotes } = req.body;

    const updatedRequest = await reviewUseCase.execute(req.user, requestId, {
        targetStatus: "APPROVED",
        adminNotes,
    });

    return res.status(200).json(
        new ApiResponse(200, updatedRequest, "Verification request approved successfully")
    );
});

export const rejectRequest = asynchandler(async (req, res) => {
    const { requestId } = req.params;
    const { adminNotes } = req.body;

    const updatedRequest = await reviewUseCase.execute(req.user, requestId, {
        targetStatus: "REJECTED",
        adminNotes,
    });

    return res.status(200).json(
        new ApiResponse(200, updatedRequest, "Verification request rejected")
    );
});
