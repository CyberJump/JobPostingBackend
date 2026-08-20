import { z } from "zod";

export const createAdminSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required"),
        username: z.string().min(1, "Username is required"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
    }),
});

export const updateJobAdminSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        requirements: z.array(z.string()).or(z.string()).optional(),
        location: z.string().optional(),
        salary: z.union([z.number(), z.string(), z.object({}).passthrough()]).optional(),
        jobType: z.enum(["FULLTIME", "INTERNSHIP"]).optional(),
        status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
        applicationDeadline: z.string().optional(),
    }),
});
