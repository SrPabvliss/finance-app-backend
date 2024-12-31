import { users } from "@/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const userBaseSchema = createInsertSchema(users);
export const selectUsersSchema = createSelectSchema(users);

export const createUserSchema = userBaseSchema
	.extend({
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.max(100, "Password must not exceed 100 characters")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[a-z]/, "Password must contain at least one lowercase letter")
			.regex(/[0-9]/, "Password must contain at least one number"),
		email: z.string().email("Invalid email format"),
	})
	.omit({
		id: true,
		password_hash: true,
		registration_date: true,
		recovery_token: true,
		recovery_token_expires: true,
		active: true,
	});

export const updateUserSchema = userBaseSchema
	.extend({
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.max(100, "Password must not exceed 100 characters")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[a-z]/, "Password must contain at least one lowercase letter")
			.regex(/[0-9]/, "Password must contain at least one number")
			.optional(),
		email: z.string().email("Invalid email format").optional(),
	})
	.partial()
	.omit({
		id: true,
		password_hash: true,
		registration_date: true,
		recovery_token: true,
		recovery_token_expires: true,
	});
