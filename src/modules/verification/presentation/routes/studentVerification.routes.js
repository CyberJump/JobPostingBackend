import { Router } from "express";
import { verifyJWT, verifyRole } from "../../../../middlewares/auth.middleware.js";
import { validate } from "../../../../middlewares/validate.middleware.js";
import {
    createVerificationRequest,
    getMyVerificationRequest,
    getAllPendingRequests,
    approveRequest,
    rejectRequest,
} from "../controllers/studentVerification.controller.js";
import {
    createVerificationSchema,
    reviewVerificationSchema,
} from "../../schemas/studentVerification.schemas.js";

const router = Router();

router.post(
    "/",
    verifyJWT,
    validate(createVerificationSchema),
    createVerificationRequest
);

router.get(
    "/my-request",
    verifyJWT,
    getMyVerificationRequest
);

// ==================== ADMIN ROUTES ====================
router.get(
    "/",
    verifyJWT,
    verifyRole(["ADMIN"]),
    getAllPendingRequests
);

router.patch(
    "/:requestId/approve",
    verifyJWT,
    verifyRole(["ADMIN"]),
    validate(reviewVerificationSchema),
    approveRequest
);

router.patch(
    "/:requestId/reject",
    verifyJWT,
    verifyRole(["ADMIN"]),
    validate(reviewVerificationSchema),
    rejectRequest
);

export default router;
