import { z } from "zod";

export const createVerificationSchema = z.object({
    body: z.object({
        applicantType: z.enum(["STUDENT", "COMPANY"], {
            errorMap: () => ({ message: "Invalid applicant type" }),
        }),
        studentProfileId: z.string().optional(),
        companyId: z.string().optional(),
    }),
});

export const reviewVerificationSchema = z.object({
    body: z.object({
        adminNotes: z.string().optional(),
    }),
});
