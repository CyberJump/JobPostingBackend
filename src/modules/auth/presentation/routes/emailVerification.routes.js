import { Router } from "express";
import {
    RequestEmailVerification,
    VerifyEmail,
} from "../controllers/emailVerification.controller.js";
import { validate } from "../../../../middlewares/validate.middleware.js";
import { fixedWindowRateLimiter } from "../../../../infrastructure/rateLimit/fixedWindowRateLimiter.js";
import rateLimitConfig from "../../../../infrastructure/rateLimit/rateLimit.config.js";
import {
    requestEmailVerificationSchema,
    verifyEmailSchema,
} from "../../schemas/emailVerification.schemas.js";

const router = Router();

router.post(
    "/request",
    fixedWindowRateLimiter("otpRequest", rateLimitConfig.otpRequest),
    validate(requestEmailVerificationSchema),
    RequestEmailVerification
);

router.post(
    "/verify",
    fixedWindowRateLimiter("otpVerify", rateLimitConfig.otpVerify),
    validate(verifyEmailSchema),
    VerifyEmail
);

export default router;
