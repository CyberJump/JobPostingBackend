import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const verificationApplicationSchema = new mongoose.Schema({
    // Type of applicant
    applicantType: {
        type: String,
        enum: ["STUDENT", "COMPANY"],
        required: true,
    },
    // User who submitted the application
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // Reference to student profile (if STUDENT)
    studentProfileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
    },
    // Reference to company (if COMPANY)
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
    },
    // Application status
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING",
    },
    // Admin notes (shown to user on rejection)
    adminNotes: {
        type: String,
    },
    // Admin who reviewed
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    // When it was reviewed
    reviewedAt: {
        type: Date,
    }
}, { timestamps: true });

// Index for efficient queries
verificationApplicationSchema.index({ status: 1, applicantType: 1 });
verificationApplicationSchema.index({ userId: 1 });

verificationApplicationSchema.plugin(mongooseAggregatePaginate);

export const VerificationApplication = mongoose.model("VerificationApplication", verificationApplicationSchema);
