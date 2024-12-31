import { payment_methods } from "@/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const paymentMethodBaseSchema = createInsertSchema(payment_methods);
export const selectPaymentMethodSchema = createSelectSchema(payment_methods);

export const createPaymentMethodSchema = paymentMethodBaseSchema
	.extend({
		type: z.enum(["CASH", "CARD", "BANK_ACCOUNT"]),
		last_four_digits: z.string().length(4).regex(/^\d+$/).optional(),
		shared_user_id: z.number().optional(),
	})
	.omit({
		id: true,
	})
	.refine(
		(data) => {
			if (data.type !== "CASH" && !data.last_four_digits) {
				return false;
			}
			return true;
		},
		{
			message: "Last four digits are required for CARD and BANK_ACCOUNT types",
			path: ["last_four_digits"],
		}
	);

export const updatePaymentMethodSchema = paymentMethodBaseSchema
	.extend({
		type: z.enum(["CASH", "CARD", "BANK_ACCOUNT"]).optional(),
		last_four_digits: z.string().length(4).regex(/^\d+$/).optional(),
		shared_user_id: z.number().optional().nullable(),
	})
	.partial()
	.omit({
		id: true,
		user_id: true,
	})
	.refine(
		(data) => {
			if (
				data.type &&
				data.type !== "CASH" &&
				data.last_four_digits === undefined
			) {
				return false;
			}
			return true;
		},
		{
			message:
				"Last four digits are required when changing type to CARD or BANK_ACCOUNT",
			path: ["last_four_digits"],
		}
	);

export type PaymentMethodResponse = z.infer<typeof selectPaymentMethodSchema>;
export type CreatePaymentMethodDTO = z.infer<typeof createPaymentMethodSchema>;
export type UpdatePaymentMethodDTO = z.infer<typeof updatePaymentMethodSchema>;
