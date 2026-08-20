import { Router } from "express";
import { RequestOtp, VerifyOtp } from "../controllers/otp.controller.js";
import { validate } from "../../../../middlewares/validate.middleware.js";
import { fixedWindowRateLimiter } from "../../../../infrastructure/rateLimit/fixedWindowRateLimiter.js";
import rateLimitConfig from "../../../../infrastructure/rateLimit/rateLimit.config.js";
import { requestOtpSchema, verifyOtpSchema } from "../../schemas/auth.schemas.js";

const router = Router();

router.route("/otp/request").post(
    fixedWindowRateLimiter("otpRequest", rateLimitConfig.otpRequest),
    validate(requestOtpSchema),
    RequestOtp
);

router.route("/otp/verify").post(
    fixedWindowRateLimiter("otpVerify", rateLimitConfig.otpVerify),
    validate(verifyOtpSchema),
    VerifyOtp
);

export default router;
