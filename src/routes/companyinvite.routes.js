import {Router} from "express";
import {
    SendFounderInvite,
    AcceptFounderInvite,
    RejectFounderInvite,
    GetMyInvites,
    GetCompanyInvites,
    CancelFounderInvite
} from "../controllers/companyinvite.controller.js";
import {verifyJWT,verifyRole} from "../middlewares/auth.middleware.js";
import {checkNotBlocked} from "../middlewares/admin.middleware.js";

const router=Router();

// All routes require authentication
router.use(verifyJWT);

// Invite management routes (not blocked users only + COMPANY role for sending)
// Only COMPANY users can send invites
router.route("/send").post(checkNotBlocked,verifyRole("COMPANY"),SendFounderInvite);

// Accept/Reject/Cancel - any authenticated user can accept/reject their invites
router.route("/:inviteId/accept").post(checkNotBlocked,AcceptFounderInvite);
router.route("/:inviteId/reject").post(checkNotBlocked,RejectFounderInvite);
router.route("/:inviteId/cancel").delete(checkNotBlocked,CancelFounderInvite);

// View invites routes
router.route("/my-invites").get(GetMyInvites);
router.route("/company/:companyId").get(checkNotBlocked,GetCompanyInvites);

export default router;
