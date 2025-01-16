import { scheduled_transactions } from "@/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const scheduledTransactionBaseSchema = createInsertSchema(
	scheduled_transactions
);
export const selectScheduledTransactionSchema = createSelectSchema(
	scheduled_transactions
);

const TRANSACTION_CATEGORIES = [
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

const FREQUENCIES = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as const;

export const createScheduledTransactionSchema = scheduledTransactionBaseSchema
	.extend({
		frequency: z.enum(FREQUENCIES),
		category: z.enum(TRANSACTION_CATEGORIES),
		amount: z.number().positive("Amount must be positive"),
		description: z.string().optional(),
		payment_method_id: z.number().optional(),
		next_execution_date: z.string().date(),
		active: z.boolean().default(true),
	})
	.omit({
		id: true,
	});

export const updateScheduledTransactionSchema = scheduledTransactionBaseSchema
	.extend({
		frequency: z.enum(FREQUENCIES).optional(),
		category: z.enum(TRANSACTION_CATEGORIES).optional(),
		amount: z.number().positive("Amount must be positive").optional(),
		description: z.string().optional().nullable(),
		payment_method_id: z.number().optional().nullable(),
		next_execution_date: z.string().date().optional(),
		active: z.boolean().optional(),
	})
	.partial()
	.omit({
		id: true,
		user_id: true,
	});

export type ScheduledTransactionResponse = z.infer<
	typeof selectScheduledTransactionSchema
>;
export type CreateScheduledTransactionDTO = z.infer<
	typeof createScheduledTransactionSchema
>;
export type UpdateScheduledTransactionDTO = z.infer<
	typeof updateScheduledTransactionSchema
>;
export type Frequency = (typeof FREQUENCIES)[number];
