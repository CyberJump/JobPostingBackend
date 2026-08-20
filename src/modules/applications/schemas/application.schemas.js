import { z } from "zod";

export const submitApplicationSchema = z.object({
    body: z.object({
        jobId: z.string().min(1, "Job ID is required"),
        additionalDocuments: z.array(z.string()).optional(),
    }),
});

export const reviewApplicationSchema = z.object({
    body: z.object({
        status: z.enum(["SHORTLISTED", "OFFER", "REJECTED"], {
            errorMap: () => ({ message: "Status must be SHORTLISTED, OFFER, or REJECTED" }),
        }),
        offerLetterUrl: z.string().url("Invalid offer letter URL").optional(),
    }),
});
