import { z } from "zod";

export const requestEmailVerificationSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address format"),
    }),
});

export const verifyEmailSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address format"),
        otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit numeric string"),
    }),
});
