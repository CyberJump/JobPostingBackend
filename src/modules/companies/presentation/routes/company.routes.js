import { Router } from "express";
import {
    RegisterCompany,
    UpdateCompanyDetails,
    WithdrawCompany,
    GetCompanyDetails,
    GetAllCompanies,
    GetMyCompanies,
} from "../controllers/company.controller.js";
import { verifyJWT, verifyRole } from "../../../../middlewares/auth.middleware.js";
import { checkNotBlocked } from "../../../../middlewares/admin.middleware.js";
import { upload } from "../../../../middlewares/multer.middleware.js";
import { validate } from "../../../../middlewares/validate.middleware.js";
import { registerCompanySchema, updateCompanySchema } from "../../schemas/company.schemas.js";

const router = Router();

// Public routes
router.route("/").get(GetAllCompanies);

// Protected routes
router.route("/my").get(verifyJWT, checkNotBlocked, GetMyCompanies);
router.route("/:companyId").get(GetCompanyDetails);

// Only COMPANY role can register companies
router.route("/register").post(
    verifyJWT,
    checkNotBlocked,
    verifyRole("COMPANY"),
    validate(registerCompanySchema),
    RegisterCompany
);

// Update/Withdraw - authorization checked via CompanyPolicy
router.route("/:companyId/update").patch(
    verifyJWT,
    checkNotBlocked,
    upload.single("Logo"),
    validate(updateCompanySchema),
    UpdateCompanyDetails
);

router.route("/:companyId/withdraw").delete(
    verifyJWT,
    checkNotBlocked,
    WithdrawCompany
);

export default router;
