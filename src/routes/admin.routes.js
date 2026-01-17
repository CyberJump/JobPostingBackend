import {Router} from "express";
import {
    CreateAdmin,
    RemoveAdmin,
    BlockUser,
    UnblockUser,
    BlockCompany,
    UnblockCompany,
    GetAllUsers,
    GetAllApplicationsAdmin,
    DeleteApplicationAdmin,
    GetAllJobsAdmin,
    ModifyJobAdmin,
    DeleteJobAdmin
} from "../controllers/admin.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import {verifyAdmin} from "../middlewares/admin.middleware.js";

const router=Router();

// All admin routes require authentication and admin role
router.use(verifyJWT,verifyAdmin);

// ==================== USER MANAGEMENT ====================
// Admin user management
router.route("/create-admin").post(CreateAdmin);
router.route("/remove-admin/:userId").delete(RemoveAdmin);

// User moderation
router.route("/users").get(GetAllUsers);
router.route("/users/:userId/block").patch(BlockUser);
router.route("/users/:userId/unblock").patch(UnblockUser);

// Company moderation
router.route("/companies/:companyId/block").patch(BlockCompany);
router.route("/companies/:companyId/unblock").patch(UnblockCompany);

// ==================== CONTENT MANAGEMENT ====================
// Application management
router.route("/applications").get(GetAllApplicationsAdmin);
router.route("/applications/:applicationId").delete(DeleteApplicationAdmin);

// Job management
router.route("/jobs").get(GetAllJobsAdmin);
router.route("/jobs/:jobId").patch(ModifyJobAdmin);
router.route("/jobs/:jobId").delete(DeleteJobAdmin);

export default router;
