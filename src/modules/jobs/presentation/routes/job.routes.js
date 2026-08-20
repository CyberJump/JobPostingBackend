import { Router } from "express";
import {
    CreateJobPosting,
    UpdateJobPosting,
    CloseJobPosting,
    DeleteJobPosting,
    GetJobDetails,
    GetAllJobs,
} from "../controllers/job.controller.js";
import { verifyJWT, verifyRole } from "../../../../middlewares/auth.middleware.js";
import { checkNotBlocked } from "../../../../middlewares/admin.middleware.js";
import { validate } from "../../../../middlewares/validate.middleware.js";
import { createJobSchema, updateJobSchema, getJobsQuerySchema } from "../../../../schemas/job.schemas.js";

const router = Router();

// Public routes
router.route("/").get(validate(getJobsQuerySchema), GetAllJobs);
router.route("/:jobId").get(GetJobDetails);

// Protected routes
router.route("/create").post(
    verifyJWT,
    checkNotBlocked,
    verifyRole("COMPANY"),
    validate(createJobSchema),
    CreateJobPosting
);

router.route("/:jobId/update").patch(
    verifyJWT,
    checkNotBlocked,
    validate(updateJobSchema),
    UpdateJobPosting
);

router.route("/:jobId/close").patch(verifyJWT, checkNotBlocked, CloseJobPosting);
router.route("/:jobId/delete").delete(verifyJWT, checkNotBlocked, DeleteJobPosting);

export default router;
