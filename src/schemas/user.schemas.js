import { z } from "zod";

export const registerUserSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters long"),
        email: z.string().email("Invalid email format"),
        username: z.string().min(3, "Username must be at least 3 characters long"),
        password: z.string().min(6, "Password must be at least 6 characters long"),
        role: z.enum(["STUDENT", "COMPANY", "ADMIN"]).optional(),
        companyId: z.string().optional(),
    }),
});

export const loginUserSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(1, "Password is required"),
    }),
});

export const refreshAccessTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string().optional(),
    }),
});

export const changePasswordSchema = z.object({
    body: z.object({
        oldPassword: z.string().min(1, "Old password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters long"),
    }),
});

export const updateAccountDetailsSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        username: z.string().min(3).optional(),
    }).refine((data) => data.name || data.email || data.username, {
        message: "At least one field (name, email, username) is required to update",
    }),
});
