import { Router } from "express";
import { 
    RegisterUser, 
    LoginUser, 
    LogoutUser, 
    RefreshAccessToken, 
    ChangePassword 
} from "../modules/auth/presentation/controllers/auth.controller.js";
import { 
    GetCurrentUser,
    UpdateAccountDetails, 
    UpdateProfilePhoto 
} from "../modules/users/presentation/controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { fixedWindowRateLimiter } from "../infrastructure/rateLimit/fixedWindowRateLimiter.js";
import rateLimitConfig from "../infrastructure/rateLimit/rateLimit.config.js";
import { 
    registerUserSchema, 
    loginUserSchema, 
    refreshAccessTokenSchema, 
    changePasswordSchema 
} from "../schemas/user.schemas.js";
import { updateAccountDetailsSchema } from "../modules/users/schemas/user.schemas.js";

const router = Router();

// Public Auth routes (Protected by Fixed-Window Rate Limiting)
router.route("/register").post(
    fixedWindowRateLimiter("register", rateLimitConfig.register),
    upload.single("profileImage"),
    validate(registerUserSchema),
    RegisterUser
);
router.route("/login").post(
    fixedWindowRateLimiter("login", rateLimitConfig.login),
    validate(loginUserSchema),
    LoginUser
);
router.route("/refresh-token").post(
    fixedWindowRateLimiter("refreshToken", rateLimitConfig.refreshToken),
    validate(refreshAccessTokenSchema),
    RefreshAccessToken
);

// Protected Auth routes
router.route("/logout").post(verifyJWT, LogoutUser);
router.route("/change-password").post(
    verifyJWT, 
    validate(changePasswordSchema), 
    ChangePassword
);

// Protected Users Profile & Account routes
router.route("/current-user").get(verifyJWT, GetCurrentUser);
router.route("/update-account").patch(
    verifyJWT, 
    validate(updateAccountDetailsSchema), 
    UpdateAccountDetails
);
router.route("/update-profile-photo").patch(
    verifyJWT, 
    upload.single("profileImage"), 
    UpdateProfilePhoto
);

export default router;
