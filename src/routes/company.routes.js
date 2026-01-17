import {Router} from "express";
import {
    RegisterCompany,
    UpdateCompanyDetails,
    WithdrawCompany,
    GetCompanyDetails,
    GetAllCompanies,
    GetMyCompanies
} from "../controllers/company.contoller.js";
import {verifyJWT,verifyRole} from "../middlewares/auth.middleware.js";
import {checkNotBlocked} from "../middlewares/admin.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";

const router=Router();

// Public routes (no authentication required)
router.route("/").get(GetAllCompanies);

// Protected route for company dashboard - only returns user's companies
router.route("/my").get(verifyJWT,checkNotBlocked,GetMyCompanies);

// Public route for viewing a single company profile
router.route("/:companyId").get(GetCompanyDetails);

// Only COMPANY users can register companies
router.route("/register").post(verifyJWT,checkNotBlocked,verifyRole("COMPANY"),RegisterCompany);

// Update/Withdraw - authorization checked in controller (founders or admin)
router.route("/:companyId/update").patch(
    verifyJWT,
    checkNotBlocked,
    upload.single("Logo"),
    UpdateCompanyDetails
);
router.route("/:companyId/withdraw").delete(verifyJWT,checkNotBlocked,WithdrawCompany);

export default router;
