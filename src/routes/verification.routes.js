import { Router } from "express";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
import {
    createVerificationRequest,
    getMyVerificationRequest,
    getAllPendingRequests,
    approveRequest,
    rejectRequest
} from "../controllers/verification.controller.js";

const router = Router();

// ==================== USER ROUTES ====================

// Create verification request (after onboarding)
router.post(
    "/",
    verifyJWT,
    createVerificationRequest
);

// Get my verification request status
router.get(
    "/my-request",
    verifyJWT,
    getMyVerificationRequest
);

// ==================== ADMIN ROUTES ====================

// Get all verification requests (with filters)
router.get(
    "/",
    verifyJWT,
    verifyRole(["ADMIN"]),
    getAllPendingRequests
);

// Approve a verification request
router.patch(
    "/:requestId/approve",
    verifyJWT,
    verifyRole(["ADMIN"]),
    approveRequest
);

// Reject a verification request
router.patch(
    "/:requestId/reject",
    verifyJWT,
    verifyRole(["ADMIN"]),
    rejectRequest
);

export default router;
