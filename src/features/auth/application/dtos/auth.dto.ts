import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
	name: z.string().min(1, "Name is required"),
	username: z.string().min(1, "Username is required"),
	email: z.string().email("Invalid email format"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.max(100, "Password must not exceed 100 characters")
		.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/[a-z]/, "Password must contain at least one lowercase letter")
		.regex(/[0-9]/, "Password must contain at least one number"),
});

export const authResponseSchema = z.object({
	id: z.number(),
	email: z.string(),
	name: z.string(),
	username: z.string(),
	token: z.string(),
});

export type LoginDTO = z.infer<typeof loginSchema>;
export type RegisterDTO = z.infer<typeof registerSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
