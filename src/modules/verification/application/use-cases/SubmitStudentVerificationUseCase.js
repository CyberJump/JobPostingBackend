import { AppError } from "../../../../shared/errors/AppError.js";

export class SubmitStudentVerificationUseCase {
    constructor(verificationRepository) {
        this.verificationRepository = verificationRepository;
    }

    async execute(userId, { applicantType, studentProfileId, companyId }) {
        if (!userId) {
            throw new AppError(401, "Authentication required");
        }

        if (!applicantType || !["STUDENT", "COMPANY"].includes(applicantType)) {
            throw new AppError(400, "Invalid applicant type");
        }

        const existingPending = await this.verificationRepository.findPendingByUserId(userId);
        if (existingPending) {
            throw new AppError(400, "You already have a pending verification request");
        }

        if (applicantType === "STUDENT" && !studentProfileId) {
            throw new AppError(400, "Student profile ID is required");
        }
        if (applicantType === "COMPANY" && !companyId) {
            throw new AppError(400, "Company ID is required");
        }

        return await this.verificationRepository.create({
            applicantType,
            userId,
            studentProfileId: applicantType === "STUDENT" ? studentProfileId : undefined,
            companyId: applicantType === "COMPANY" ? companyId : undefined,
            status: "PENDING",
        });
    }
}

export default SubmitStudentVerificationUseCase;
