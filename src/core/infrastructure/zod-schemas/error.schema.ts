import { z } from "zod";

export const errorSchema = z.object({
	error: z.object({
		issues: z.array(
			z.object({
				code: z.string(),
				path: z.array(z.union([z.string(), z.number()])),
				message: z.string().optional(),
			})
		),
		name: z.string(),
	}),
	success: z.boolean(),
});

export type ErrorResponse = z.infer<typeof errorSchema>;
