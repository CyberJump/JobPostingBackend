import { asynchandler } from "../../../../utils/asynchandler.js";
import { ApiResponse } from "../../../../utils/ApiResponse.js";
import RequestOtpUseCase from "../../application/use-cases/RequestOtpUseCase.js";
import VerifyOtpUseCase from "../../application/use-cases/VerifyOtpUseCase.js";

const requestOtpUseCase = new RequestOtpUseCase();
const verifyOtpUseCase = new VerifyOtpUseCase();

export const RequestOtp = asynchandler(async (req, res) => {
    const { email, purpose } = req.body;
    const result = await requestOtpUseCase.execute({ email, purpose });

    return res.status(200).json(
        new ApiResponse(200, result, "OTP code request processed")
    );
});

export const VerifyOtp = asynchandler(async (req, res) => {
    const { email, otp, purpose } = req.body;
    const result = await verifyOtpUseCase.execute({ email, otp, purpose });

    return res.status(200).json(
        new ApiResponse(200, result, "OTP verification successful")
    );
});
