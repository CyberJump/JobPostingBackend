import { Router } from "express";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { 
    CreateStudentProfile, 
    GetStudentDetails, 
    UpdateStudentDetails 
} from "../controllers/student.contoller.js";
import { Student } from "../models/student.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";

const router = Router();

// ==================== STUDENT ROUTES ====================

// Create student profile (with verification document upload)
router.post(
    "/",
    verifyJWT,
    verifyRole(["STUDENT"]),
    upload.single("verificationDocument"),
    CreateStudentProfile
);

// Get current student's profile
router.get(
    "/profile",
    verifyJWT,
    verifyRole(["STUDENT"]),
    GetStudentDetails
);

// Update student profile
router.patch(
    "/profile",
    verifyJWT,
    verifyRole(["STUDENT"]),
    upload.single("verificationDocument"),
    UpdateStudentDetails
);

// ==================== ADMIN ROUTES FOR STUDENTS ====================

// Get all pending students (for admin verification)
router.get(
    "/pending",
    verifyJWT,
    verifyRole(["ADMIN"]),
    asynchandler(async (req, res) => {
        const pendingStudents = await Student.find({ status: "PENDING" })
            .populate("userId", "name email username profilePicture")
            .sort({ createdAt: -1 });
        
        return res.status(200).json(
            new ApiResponse(200, pendingStudents, "Pending students fetched successfully")
        );
    })
);

// Verify student (admin only)
router.patch(
    "/:studentId/verify",
    verifyJWT,
    verifyRole(["ADMIN"]),
    asynchandler(async (req, res) => {
        const { studentId } = req.params;
        
        const student = await Student.findByIdAndUpdate(
            studentId,
            { $set: { status: "VERIFIED", verifiedBy: req.user._id } },
            { new: true }
        ).populate("userId", "name email username");
        
        if (!student) {
            throw new ApiError(404, "Student profile not found");
        }
        
        return res.status(200).json(
            new ApiResponse(200, student, "Student verified successfully")
        );
    })
);

// Reject student verification (admin only)
router.patch(
    "/:studentId/reject",
    verifyJWT,
    verifyRole(["ADMIN"]),
    asynchandler(async (req, res) => {
        const { studentId } = req.params;
        
        const student = await Student.findByIdAndUpdate(
            studentId,
            { $set: { status: "REJECTED" } },
            { new: true }
        ).populate("userId", "name email username");
        
        if (!student) {
            throw new ApiError(404, "Student profile not found");
        }
        
        return res.status(200).json(
            new ApiResponse(200, student, "Student verification rejected")
        );
    })
);

export default router;
