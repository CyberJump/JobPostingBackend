import { z } from "zod";

export const requestOtpSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        purpose: z.enum(["email_verify", "password_reset"]).optional().default("email_verify"),
    }),
});

export const verifyOtpSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        otp: z.string().length(6, "OTP must be exactly 6 digits"),
        purpose: z.enum(["email_verify", "password_reset"]).optional().default("email_verify"),
    }),
});
