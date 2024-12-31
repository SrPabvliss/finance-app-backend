import { budgets } from "@/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const budgetBaseSchema = createInsertSchema(budgets);
export const selectBudgetSchema = createSelectSchema(budgets);

const BUDGET_CATEGORIES = [
	"FOOD",
	"TRANSPORT",
	"UTILITIES",
	"ENTERTAINMENT",
	"HEALTHCARE",
	"EDUCATION",
	"SHOPPING",
	"HOUSING",
	"OTHER",
] as const;

export const createBudgetSchema = budgetBaseSchema
	.extend({
		category: z.enum(BUDGET_CATEGORIES),
		limit_amount: z.number().positive("Limit amount must be positive"),
		current_amount: z
			.number()
			.min(0, "Current amount cannot be negative")
			.optional(),
		month: z.string().datetime(),
		shared_user_id: z.number().optional(),
	})
	.omit({
		id: true,
	});

export const updateBudgetSchema = budgetBaseSchema
	.extend({
		category: z.enum(BUDGET_CATEGORIES).optional(),
		limit_amount: z
			.number()
			.positive("Limit amount must be positive")
			.optional(),
		current_amount: z
			.number()
			.min(0, "Current amount cannot be negative")
			.optional(),
		month: z.string().datetime().optional(),
		shared_user_id: z.number().optional().nullable(),
	})
	.partial()
	.omit({
		id: true,
		user_id: true,
	});

export const updateAmountSchema = z.object({
	amount: z.number(),
});

export type BudgetResponse = z.infer<typeof selectBudgetSchema>;
export type CreateBudgetDTO = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetDTO = z.infer<typeof updateBudgetSchema>;
export type UpdateAmountDTO = z.infer<typeof updateAmountSchema>;
