import { debts } from "@/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const debtBaseSchema = createInsertSchema(debts);
export const selectDebtSchema = createSelectSchema(debts);

export const createDebtSchema = debtBaseSchema
	.extend({
		original_amount: z.number().positive("Amount must be positive"),
		pending_amount: z.number().positive("Pending amount must be positive"),
		due_date: z.string().date(),
		paid: z.boolean().default(false),
		creditor_id: z.number().optional(),
	})
	.omit({
		id: true,
	});

export const updateDebtSchema = debtBaseSchema
	.extend({
		description: z.string().optional(),
		pending_amount: z
			.number()
			.positive("Pending amount must be positive")
			.optional(),
		due_date: z.string().date().optional(),
		paid: z.boolean().optional(),
	})
	.partial()
	.omit({
		id: true,
		user_id: true,
		creditor_id: true,
		original_amount: true,
	});

export const payDebtSchema = z.object({
	amount: z.number().positive("Payment amount must be positive"),
});
