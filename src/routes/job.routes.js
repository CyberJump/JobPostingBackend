import {Router} from "express";
import {
    CreateJobPosting,
    UpdateJobPosting,
    CloseJobPosting,
    DeleteJobPosting,
    GetJobDetails,
    GetAllJobs
} from "../controllers/job.controller.js";
import {verifyJWT,verifyRole} from "../middlewares/auth.middleware.js";
import {checkNotBlocked} from "../middlewares/admin.middleware.js";

const router=Router();

// Public routes (no authentication required)
router.route("/").get(GetAllJobs);
router.route("/:jobId").get(GetJobDetails);

// Protected routes (authentication required + not blocked + COMPANY role for creation)
// Only COMPANY users can create jobs
router.route("/create").post(verifyJWT,checkNotBlocked,verifyRole("COMPANY"),CreateJobPosting);

// Update/Close/Delete - authorization checked in controller (founders or admin)
router.route("/:jobId/update").patch(verifyJWT,checkNotBlocked,UpdateJobPosting);
router.route("/:jobId/close").patch(verifyJWT,checkNotBlocked,CloseJobPosting);
router.route("/:jobId/delete").delete(verifyJWT,checkNotBlocked,DeleteJobPosting);

export default router;
