import {Router} from "express";
import {
    RegisterCompany,
    UpdateCompanyDetails,
    WithdrawCompany,
    GetCompanyDetails,
    GetAllCompanies
} from "../controllers/company.contoller.js";
import {verifyJWT,verifyRole} from "../middlewares/auth.middleware.js";
import {checkNotBlocked} from "../middlewares/admin.middleware.js";

const router=Router();

// Public routes (no authentication required)
router.route("/").get(GetAllCompanies);
router.route("/:companyId").get(GetCompanyDetails);

// Protected routes (authentication required + not blocked + COMPANY role for registration)
// Only COMPANY users can register companies
router.route("/register").post(verifyJWT,checkNotBlocked,verifyRole("COMPANY"),RegisterCompany);

// Update/Withdraw - authorization checked in controller (founders or admin)
router.route("/:companyId/update").patch(verifyJWT,checkNotBlocked,UpdateCompanyDetails);
router.route("/:companyId/withdraw").delete(verifyJWT,checkNotBlocked,WithdrawCompany);

export default router;
