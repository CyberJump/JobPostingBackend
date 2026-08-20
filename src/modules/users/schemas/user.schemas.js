import { z } from "zod";

export const updateAccountDetailsSchema = z.object({
    body: z.object({
        name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
        email: z.string().email("Invalid email address").optional(),
        username: z.string().trim().min(3, "Username must be at least 3 characters").optional(),
    }).refine((data) => data.name || data.email || data.username, {
        message: "At least one field (name, email, username) must be provided",
    }),
});
