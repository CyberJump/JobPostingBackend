import { Router } from "express";
import {
    SubmitApplication,
    DeleteApplication,
    GetJobApplications,
    GetUserApplications,
    GetApplicationStatus,
    ReviewApplication,
} from "../controllers/application.controller.js";
import { verifyJWT, verifyRole } from "../../../../middlewares/auth.middleware.js";
import { checkNotBlocked } from "../../../../middlewares/admin.middleware.js";
import { upload } from "../../../../middlewares/multer.middleware.js";
import { validate } from "../../../../middlewares/validate.middleware.js";
import { submitApplicationSchema, reviewApplicationSchema } from "../../schemas/application.schemas.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Student application routes
router.route("/submit").post(
    checkNotBlocked,
    upload.single("resume"),
    validate(submitApplicationSchema),
    SubmitApplication
);

router.route("/my-applications").get(GetUserApplications);
router.route("/:applicationId").delete(checkNotBlocked, DeleteApplication);
router.route("/:applicationId/status").get(GetApplicationStatus);

// Company founder routes
router.route("/job/:jobId").get(checkNotBlocked, verifyRole("COMPANY"), GetJobApplications);
router.route("/:applicationId/review").patch(
    checkNotBlocked,
    verifyRole("COMPANY"),
    validate(reviewApplicationSchema),
    ReviewApplication
);

export default router;
