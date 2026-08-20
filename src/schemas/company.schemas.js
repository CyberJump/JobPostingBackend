import { z } from "zod";
import { objectIdSchema } from "./common.schemas.js";

export const createCompanySchema = z.object({
    body: z.object({
        name: z.string().min(2, "Company name is required"),
        email: z.string().email("Invalid email format"),
        description: z.string().min(10, "Company description is required"),
        website: z.string().optional(),
    }),
});

export const updateCompanySchema = z.object({
    params: z.object({
        companyId: objectIdSchema,
    }),
    body: z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        description: z.string().min(10).optional(),
        website: z.string().optional(),
    }),
});
