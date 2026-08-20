import { asynchandler } from "../../../../utils/asynchandler.js";
import { ApiResponse } from "../../../../utils/ApiResponse.js";
import MongoEmailVerificationRepository from "../../infrastructure/repositories/MongoEmailVerificationRepository.js";
import RequestEmailVerificationUseCase from "../../application/use-cases/RequestEmailVerificationUseCase.js";
import VerifyEmailUseCase from "../../application/use-cases/VerifyEmailUseCase.js";

const repo = new MongoEmailVerificationRepository();
const requestEmailVerificationUseCase = new RequestEmailVerificationUseCase(repo);
const verifyEmailUseCase = new VerifyEmailUseCase(repo);

export const RequestEmailVerification = asynchandler(async (req, res) => {
    const { email } = req.body;
    const result = await requestEmailVerificationUseCase.execute({ email });

    return res.status(200).json(
        new ApiResponse(200, result, "Verification email request processed")
    );
});

export const VerifyEmail = asynchandler(async (req, res) => {
    const { email, otp } = req.body;
    const result = await verifyEmailUseCase.execute({ email, otp });

    return res.status(200).json(
        new ApiResponse(200, result, "Email verification successful")
    );
});
