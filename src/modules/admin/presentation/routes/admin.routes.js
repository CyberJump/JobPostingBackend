import { Router } from "express";
import { verifyJWT, verifyRole } from "../../../../middlewares/auth.middleware.js";
import { validate } from "../../../../middlewares/validate.middleware.js";
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
    DeleteJobAdmin,
} from "../controllers/admin.controller.js";
import {
    createAdminSchema,
    updateJobAdminSchema,
} from "../../schemas/admin.schemas.js";

const router = Router();

// All admin routes require authentication and admin role
router.use(verifyJWT, verifyRole(["ADMIN"]));

// ==================== USER MANAGEMENT ====================
router.post("/create-admin", validate(createAdminSchema), CreateAdmin);
router.delete("/remove-admin/:userId", RemoveAdmin);

// User moderation
router.get("/users", GetAllUsers);
router.patch("/users/:userId/block", BlockUser);
router.patch("/users/:userId/unblock", UnblockUser);

// Company moderation
router.patch("/companies/:companyId/block", BlockCompany);
router.patch("/companies/:companyId/unblock", UnblockCompany);

// ==================== CONTENT MANAGEMENT ====================
// Application management
router.get("/applications", GetAllApplicationsAdmin);
router.delete("/applications/:applicationId", DeleteApplicationAdmin);

// Job management
router.get("/jobs", GetAllJobsAdmin);
router.patch("/jobs/:jobId", validate(updateJobAdminSchema), ModifyJobAdmin);
router.delete("/jobs/:jobId", DeleteJobAdmin);

export default router;
