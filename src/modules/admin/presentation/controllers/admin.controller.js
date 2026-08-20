import { asynchandler } from "../../../../utils/asynchandler.js";
import { ApiResponse } from "../../../../utils/ApiResponse.js";
import MongoAdminRepository from "../../infrastructure/repositories/MongoAdminRepository.js";
import MongoModerationRepository from "../../infrastructure/repositories/MongoModerationRepository.js";
import CreateAdminUseCase from "../../application/use-cases/CreateAdminUseCase.js";
import RemoveAdminUseCase from "../../application/use-cases/RemoveAdminUseCase.js";
import BlockUserUseCase from "../../application/use-cases/BlockUserUseCase.js";
import UnblockUserUseCase from "../../application/use-cases/UnblockUserUseCase.js";
import BlockCompanyUseCase from "../../application/use-cases/BlockCompanyUseCase.js";
import UnblockCompanyUseCase from "../../application/use-cases/UnblockCompanyUseCase.js";
import ListUsersForModerationUseCase from "../../application/use-cases/ListUsersForModerationUseCase.js";
import ListApplicationsAdminUseCase from "../../application/use-cases/ListApplicationsAdminUseCase.js";
import DeleteApplicationAdminUseCase from "../../application/use-cases/DeleteApplicationAdminUseCase.js";
import ListJobsAdminUseCase from "../../application/use-cases/ListJobsAdminUseCase.js";
import ModifyJobAdminUseCase from "../../application/use-cases/ModifyJobAdminUseCase.js";
import DeleteJobAdminUseCase from "../../application/use-cases/DeleteJobAdminUseCase.js";

const adminRepo = new MongoAdminRepository();
const moderationRepo = new MongoModerationRepository();

const createAdminUseCase = new CreateAdminUseCase(adminRepo);
const removeAdminUseCase = new RemoveAdminUseCase(adminRepo);
const blockUserUseCase = new BlockUserUseCase(moderationRepo);
const unblockUserUseCase = new UnblockUserUseCase(moderationRepo);
const blockCompanyUseCase = new BlockCompanyUseCase(moderationRepo);
const unblockCompanyUseCase = new UnblockCompanyUseCase(moderationRepo);
const listUsersUseCase = new ListUsersForModerationUseCase(moderationRepo);
const listApplicationsUseCase = new ListApplicationsAdminUseCase(moderationRepo);
const deleteApplicationUseCase = new DeleteApplicationAdminUseCase(moderationRepo);
const listJobsUseCase = new ListJobsAdminUseCase(moderationRepo);
const modifyJobUseCase = new ModifyJobAdminUseCase(moderationRepo);
const deleteJobUseCase = new DeleteJobAdminUseCase(moderationRepo);

export const CreateAdmin = asynchandler(async (req, res) => {
    const createdAdmin = await createAdminUseCase.execute(req.body);
    return res.status(201).json(new ApiResponse(201, createdAdmin, "Admin user created successfully"));
});

export const RemoveAdmin = asynchandler(async (req, res) => {
    const updatedUser = await removeAdminUseCase.execute(req.user, req.params.userId);
    return res.status(200).json(new ApiResponse(200, updatedUser, "Admin privileges removed successfully"));
});

export const BlockUser = asynchandler(async (req, res) => {
    const blockedUser = await blockUserUseCase.execute(req.user, req.params.userId);
    return res.status(200).json(new ApiResponse(200, blockedUser, "User blocked successfully"));
});

export const UnblockUser = asynchandler(async (req, res) => {
    const unblockedUser = await unblockUserUseCase.execute(req.user, req.params.userId);
    return res.status(200).json(new ApiResponse(200, unblockedUser, "User unblocked successfully"));
});

export const BlockCompany = asynchandler(async (req, res) => {
    const blockedCompany = await blockCompanyUseCase.execute(req.user, req.params.companyId);
    return res.status(200).json(new ApiResponse(200, blockedCompany, "Company blocked successfully"));
});

export const UnblockCompany = asynchandler(async (req, res) => {
    const unblockedCompany = await unblockCompanyUseCase.execute(req.user, req.params.companyId);
    return res.status(200).json(new ApiResponse(200, unblockedCompany, "Company unblocked successfully"));
});

export const GetAllUsers = asynchandler(async (req, res) => {
    const data = await listUsersUseCase.execute(req.query);
    return res.status(200).json(new ApiResponse(200, data, "Users fetched successfully"));
});

export const GetAllApplicationsAdmin = asynchandler(async (req, res) => {
    const applications = await listApplicationsUseCase.execute(req.query);
    return res.status(200).json(new ApiResponse(200, applications, "Applications fetched successfully"));
});

export const DeleteApplicationAdmin = asynchandler(async (req, res) => {
    await deleteApplicationUseCase.execute(req.params.applicationId);
    return res.status(200).json(new ApiResponse(200, {}, "Application deleted successfully"));
});

export const GetAllJobsAdmin = asynchandler(async (req, res) => {
    const jobs = await listJobsUseCase.execute(req.query);
    return res.status(200).json(new ApiResponse(200, jobs, "Jobs fetched successfully"));
});

export const ModifyJobAdmin = asynchandler(async (req, res) => {
    const updatedJob = await modifyJobUseCase.execute(req.params.jobId, req.body);
    return res.status(200).json(new ApiResponse(200, updatedJob, "Job updated successfully"));
});

export const DeleteJobAdmin = asynchandler(async (req, res) => {
    await deleteJobUseCase.execute(req.params.jobId);
    return res.status(200).json(new ApiResponse(200, {}, "Job deleted successfully"));
});
