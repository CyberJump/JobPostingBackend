import { z } from "zod";
import { objectIdSchema } from "./common.schemas.js";

export const createJobSchema = z.object({
    body: z.object({
        title: z.string().min(2, "Job title is required"),
        company: objectIdSchema,
        description: z.string().min(10, "Description must be at least 10 characters"),
        requirements: z.array(z.string()).or(z.string().transform((val) => [val])),
        location: z.string().min(1, "Location is required"),
        salary: z.string().min(1, "Salary is required"),
        jobType: z.enum(["FULLTIME", "INTERNSHIP"]),
        applicationDeadline: z.string().optional(),
    }),
});

export const updateJobSchema = z.object({
    params: z.object({
        jobId: objectIdSchema,
    }),
    body: z.object({
        title: z.string().min(2).optional(),
        description: z.string().min(10).optional(),
        requirements: z.array(z.string()).or(z.string().transform((val) => [val])).optional(),
        location: z.string().optional(),
        salary: z.string().optional(),
        jobType: z.enum(["FULLTIME", "INTERNSHIP"]).optional(),
        applicationDeadline: z.string().optional(),
    }),
});

export const getJobsQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        jobType: z.enum(["FULLTIME", "INTERNSHIP"]).optional(),
    }),
});
