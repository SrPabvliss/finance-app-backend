import { goals } from "@/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const goalBaseSchema = createInsertSchema(goals);
export const selectGoalSchema = createSelectSchema(goals);

export const createGoalSchema = goalBaseSchema
	.extend({
		target_amount: z.number().positive("Target amount must be positive"),
		current_amount: z
			.number()
			.min(0, "Current amount cannot be negative")
			.optional(),
		end_date: z.string().date(),
		shared_user_id: z.number().optional(),
	})
	.omit({
		id: true,
	});

export const updateGoalSchema = goalBaseSchema
	.extend({
		target_amount: z
			.number()
			.positive("Target amount must be positive")
			.optional(),
		current_amount: z
			.number()
			.min(0, "Current amount cannot be negative")
			.optional(),
		end_date: z.string().date().optional(),
		shared_user_id: z.number().optional().nullable(),
	})
	.partial()
	.omit({
		id: true,
		user_id: true,
	});

export const updateProgressSchema = z.object({
	amount: z.number().min(0, "Amount cannot be negative"),
});

export type GoalResponse = z.infer<typeof selectGoalSchema>;
export type CreateGoalDTO = z.infer<typeof createGoalSchema>;
export type UpdateGoalDTO = z.infer<typeof updateGoalSchema>;
export type UpdateProgressDTO = z.infer<typeof updateProgressSchema>;
