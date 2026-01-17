import {Router} from "express";
import {
    SubmitApplication,
    DeleteApplication,
    GetJobApplications,
    GetUserApplications,
    GetApplicationStatus,
    ReviewApplication
} from "../controllers/application.controller.js";
import {verifyJWT,verifyRole} from "../middlewares/auth.middleware.js";
import {checkNotBlocked} from "../middlewares/admin.middleware.js";
import {upload} from "../middlewares/Multer.middleware.js";

const router=Router();

// All routes require authentication
router.use(verifyJWT);

// User application routes (not blocked users only)
// Any authenticated user can submit applications (with resume file upload)
router.route("/submit").post(checkNotBlocked, upload.single("resume"), SubmitApplication);
router.route("/:applicationId").delete(checkNotBlocked,DeleteApplication);
router.route("/my-applications").get(GetUserApplications);
router.route("/:applicationId/status").get(GetApplicationStatus);

// Company founder routes (not blocked users only + COMPANY role)
// Only COMPANY users can view and review job applications
router.route("/job/:jobId").get(checkNotBlocked,verifyRole("COMPANY"),GetJobApplications);
router.route("/:applicationId/review").patch(checkNotBlocked,verifyRole("COMPANY"),ReviewApplication);

export default router;
