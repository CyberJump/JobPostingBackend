import { z } from "zod";

export const registerCompanySchema = z.object({
    body: z.object({
        name: z.string().trim().min(2, "Company name must be at least 2 characters"),
        email: z.string().email("Invalid company email address"),
        description: z.string().trim().min(5, "Description must be at least 5 characters"),
        website: z.string().url("Invalid website URL").optional().or(z.literal("")),
        Logo: z.string().optional(),
    }),
});

export const updateCompanySchema = z.object({
    body: z.object({
        name: z.string().trim().min(2, "Company name must be at least 2 characters").optional(),
        email: z.string().email("Invalid company email address").optional(),
        description: z.string().trim().min(5, "Description must be at least 5 characters").optional(),
        website: z.string().url("Invalid website URL").optional().or(z.literal("")),
        Logo: z.string().optional(),
    }),
});
