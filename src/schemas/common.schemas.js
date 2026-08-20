import { z } from "zod";
import mongoose from "mongoose";

// MongoDB ObjectId validation
export const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid MongoDB ObjectId format",
});

// Common pagination and query parameters
export const paginationQuerySchema = z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.min(parseInt(val, 10), 100) : 10)),
    search: z.string().optional(),
});

// Parameter schema with single id parameter
export const mongoIdParamSchema = z.object({
    id: objectIdSchema.optional(),
    userId: objectIdSchema.optional(),
    jobId: objectIdSchema.optional(),
    companyId: objectIdSchema.optional(),
    applicationId: objectIdSchema.optional(),
    studentId: objectIdSchema.optional(),
    inviteId: objectIdSchema.optional(),
});
