import { asynchandler } from "../../../../utils/asynchandler.js";
import { ApiResponse } from "../../../../utils/ApiResponse.js";

import MongoJobRepository from "../../infrastructure/repositories/MongoJobRepository.js";
import CreateJobUseCase from "../../application/use-cases/CreateJobUseCase.js";
import GetJobUseCase from "../../application/use-cases/GetJobUseCase.js";
import UpdateJobUseCase from "../../application/use-cases/UpdateJobUseCase.js";
import CloseJobUseCase from "../../application/use-cases/CloseJobUseCase.js";
import DeleteJobUseCase from "../../application/use-cases/DeleteJobUseCase.js";
import ListJobsUseCase from "../../application/use-cases/ListJobsUseCase.js";

const jobRepo = new MongoJobRepository();

const createJobUseCase = new CreateJobUseCase(jobRepo);
const getJobUseCase = new GetJobUseCase(jobRepo);
const updateJobUseCase = new UpdateJobUseCase(jobRepo);
const closeJobUseCase = new CloseJobUseCase(jobRepo);
const deleteJobUseCase = new DeleteJobUseCase(jobRepo);
const listJobsUseCase = new ListJobsUseCase(jobRepo);

export const CreateJobPosting = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    const { title, company, description, requirements, location, salary, jobType, applicationDeadline } = req.body;

    const createdJob = await createJobUseCase.execute(userId, {
        title,
        company,
        description,
        requirements,
        location,
        salary,
        jobType,
        applicationDeadline,
    });

    return res.status(201).json(
        new ApiResponse(200, createdJob, "Job posting created successfully")
    );
});

export const UpdateJobPosting = asynchandler(async (req, res) => {
    const { jobId } = req.params;
    const { title, description, requirements, location, salary, jobType, applicationDeadline } = req.body;

    const updatedJob = await updateJobUseCase.execute(req.user, jobId, {
        title,
        description,
        requirements,
        location,
        salary,
        jobType,
        applicationDeadline,
    });

    return res.status(200).json(
        new ApiResponse(200, updatedJob, "Job posting updated successfully")
    );
});

export const CloseJobPosting = asynchandler(async (req, res) => {
    const { jobId } = req.params;

    const closedJob = await closeJobUseCase.execute(req.user, jobId);

    return res.status(200).json(
        new ApiResponse(200, closedJob, "Job posting closed successfully")
    );
});

export const DeleteJobPosting = asynchandler(async (req, res) => {
    const { jobId } = req.params;

    await deleteJobUseCase.execute(req.user, jobId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Job posting deleted successfully")
    );
});

export const GetJobDetails = asynchandler(async (req, res) => {
    const { jobId } = req.params;

    const job = await getJobUseCase.execute(jobId);

    return res.status(200).json(
        new ApiResponse(200, job, "Job details fetched successfully")
    );
});

export const GetAllJobs = asynchandler(async (req, res) => {
    const { page, limit, status, sortBy, jobType, search, includeExpired } = req.query;

    const jobs = await listJobsUseCase.execute(
        { page, limit, status, sortBy, jobType, search, includeExpired },
        req.user
    );

    return res.status(200).json(
        new ApiResponse(200, jobs, "Jobs fetched successfully")
    );
});
