import { asynchandler } from "../../../../utils/asynchandler.js";
import { ApiResponse } from "../../../../utils/ApiResponse.js";

import MongoApplicationRepository from "../../infrastructure/repositories/MongoApplicationRepository.js";
import SubmitApplicationUseCase from "../../application/use-cases/SubmitApplicationUseCase.js";
import GetApplicationUseCase from "../../application/use-cases/GetApplicationUseCase.js";
import ListStudentApplicationsUseCase from "../../application/use-cases/ListStudentApplicationsUseCase.js";
import ListCompanyApplicationsUseCase from "../../application/use-cases/ListCompanyApplicationsUseCase.js";
import WithdrawApplicationUseCase from "../../application/use-cases/WithdrawApplicationUseCase.js";
import ReviewApplicationUseCase from "../../application/use-cases/ReviewApplicationUseCase.js";

const applicationRepo = new MongoApplicationRepository();

const submitApplicationUseCase = new SubmitApplicationUseCase(applicationRepo);
const getApplicationUseCase = new GetApplicationUseCase(applicationRepo);
const listStudentApplicationsUseCase = new ListStudentApplicationsUseCase(applicationRepo);
const listCompanyApplicationsUseCase = new ListCompanyApplicationsUseCase(applicationRepo);
const withdrawApplicationUseCase = new WithdrawApplicationUseCase(applicationRepo);
const reviewApplicationUseCase = new ReviewApplicationUseCase(applicationRepo);

export const SubmitApplication = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    const { jobId, additionalDocuments } = req.body;
    const resumeFilePath = req.file?.path;
    const idempotencyKey = req.header("X-Idempotency-Key");

    const createdApplication = await submitApplicationUseCase.execute(
        userId,
        { jobId, additionalDocuments },
        resumeFilePath,
        idempotencyKey
    );

    return res.status(201).json(
        new ApiResponse(201, createdApplication, "Application submitted successfully")
    );
});

export const DeleteApplication = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    const { applicationId } = req.params;

    await withdrawApplicationUseCase.execute(userId, applicationId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Application deleted successfully")
    );
});

export const GetJobApplications = asynchandler(async (req, res) => {
    const { jobId } = req.params;
    const { page, limit, status } = req.query;

    const applications = await listCompanyApplicationsUseCase.execute(
        req.user,
        jobId,
        { page, limit, status }
    );

    return res.status(200).json(
        new ApiResponse(200, applications, "Applications fetched successfully")
    );
});

export const GetUserApplications = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    const { page, limit, status } = req.query;

    const applications = await listStudentApplicationsUseCase.execute(
        userId,
        { page, limit, status }
    );

    return res.status(200).json(
        new ApiResponse(200, applications, "Your applications fetched successfully")
    );
});

export const GetApplicationStatus = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    const { applicationId } = req.params;

    const application = await getApplicationUseCase.execute(userId, applicationId);

    return res.status(200).json(
        new ApiResponse(200, application, "Application status fetched successfully")
    );
});

export const ReviewApplication = asynchandler(async (req, res) => {
    const { applicationId } = req.params;
    const { status, offerLetterUrl } = req.body;

    const updatedApplication = await reviewApplicationUseCase.execute(
        req.user,
        applicationId,
        { status, offerLetterUrl }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedApplication, `Application ${status.toLowerCase()} successfully`)
    );
});
