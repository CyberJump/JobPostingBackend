import { AppError } from "../../../../shared/errors/AppError.js";

export class GetStudentVerificationStatusUseCase {
    constructor(verificationRepository) {
        this.verificationRepository = verificationRepository;
    }

    async execute(userId) {
        if (!userId) {
            throw new AppError(401, "Authentication required");
        }

        const request = await this.verificationRepository.findByUserId(userId);
        if (!request) {
            throw new AppError(404, "No verification request found");
        }

        return request;
    }
}

export default GetStudentVerificationStatusUseCase;
