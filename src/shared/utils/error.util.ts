import { ErrorResponse } from "@/core/infrastructure/zod-schemas/error.schema";

export const createErrorResponse = (message: string): ErrorResponse => ({
	error: {
		issues: [
			{
				code: "VALIDATION_ERROR",
				path: [],
				message,
			},
		],
		name: "ValidationError",
	},
	success: false,
});
