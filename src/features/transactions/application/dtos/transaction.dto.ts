import { transactions } from "@/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const transactionBaseSchema = createInsertSchema(transactions);
export const selectTransactionSchema = createSelectSchema(transactions);

// Categorías predefinidas para ingresos y gastos
const INCOME_CATEGORIES = [
	"SALARY",
	"INVESTMENT",
	"BUSINESS",
	"FREELANCE",
	"GIFT",
	"OTHER_INCOME",
] as const;

const EXPENSE_CATEGORIES = [
	"FOOD",
	"TRANSPORT",
	"UTILITIES",
	"ENTERTAINMENT",
	"HEALTHCARE",
	"EDUCATION",
	"SHOPPING",
	"HOUSING",
	"OTHER_EXPENSE",
] as const;

export const createTransactionSchema = transactionBaseSchema
	.extend({
		type: z.enum(["INCOME", "EXPENSE"]),
		category: z.string(),
		amount: z.number().positive("Amount must be positive"),
		description: z.string().optional(),
		payment_method_id: z.number().optional(),
		scheduled_transaction_id: z.number().optional(),
		debt_id: z.number().optional(),
	})
	.omit({
		id: true,
		date: true,
	})
	.refine(
		(data) => {
			if (data.type === "INCOME") {
				return INCOME_CATEGORIES.includes(data.category as any);
			} else {
				return EXPENSE_CATEGORIES.includes(data.category as any);
			}
		},
		{
			message: "Invalid category for the specified transaction type",
			path: ["category"],
		}
	);

export const updateTransactionSchema = transactionBaseSchema
	.extend({
		type: z.enum(["INCOME", "EXPENSE"]).optional(),
		category: z.string().optional(),
		amount: z.number().positive("Amount must be positive").optional(),
		description: z.string().optional().nullable(),
		payment_method_id: z.number().optional().nullable(),
		scheduled_transaction_id: z.number().optional().nullable(),
		debt_id: z.number().optional().nullable(),
	})
	.partial()
	.omit({
		id: true,
		user_id: true,
		date: true,
	})
	.refine(
		(data) => {
			if (data.type && data.category) {
				if (data.type === "INCOME") {
					return INCOME_CATEGORIES.includes(data.category as any);
				} else {
					return EXPENSE_CATEGORIES.includes(data.category as any);
				}
			}
			return true;
		},
		{
			message: "Invalid category for the specified transaction type",
			path: ["category"],
		}
	);

export const transactionFiltersSchema = z.object({
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
	type: z.enum(["INCOME", "EXPENSE"]).optional(),
	category: z.string().optional(),
	payment_method_id: z.number().optional(),
	min_amount: z
		.string()
		.transform((val) => Number(val))
		.pipe(z.number())
		.optional(),
	max_amount: z
		.string()
		.transform((val) => Number(val))
		.pipe(z.number())
		.optional(),
});

export type CreateTransactionDTO = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionDTO = z.infer<typeof updateTransactionSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
export type TransactionResponse = z.infer<typeof selectTransactionSchema>;
