import { Router } from "express";
import { 
    RegisterUser, 
    LoginUser, 
    LogoutUser, 
    RefreshAccessToken, 
    ChangePassword, 
    GetCurrentUser, 
    UpdateAccountDetails, 
    UpdateProfilePhoto 
} from "../controllers/user.contoller.js";
import { upload } from "../middlewares/Multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(
    upload.single("profileImage"),
    RegisterUser
);
router.route("/login").post(LoginUser);
router.route("/refresh-token").post(RefreshAccessToken);

// Protected routes
router.route("/logout").post(verifyJWT, LogoutUser);
router.route("/change-password").post(verifyJWT, ChangePassword);
router.route("/current-user").get(verifyJWT, GetCurrentUser);
router.route("/update-account").patch(verifyJWT, UpdateAccountDetails);
router.route("/update-profile-photo").patch(
    verifyJWT, 
    upload.single("profileImage"), 
    UpdateProfilePhoto
);

export default router;
