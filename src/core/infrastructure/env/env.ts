import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "node:path";
import { z } from "zod";

expand(
	config({
		path: path.resolve(
			process.cwd(),
			process.env.NODE_ENV === "test" ? ".env.test" : ".env"
		),
	})
);

const EnvSchema = z
	.object({
		NODE_ENV: z.string().default("development"),
		PORT: z.coerce.number().default(9999),
		LOG_LEVEL: z.enum([
			"fatal",
			"error",
			"warn",
			"info",
			"debug",
			"trace",
			"silent",
		]),
		DATABASE_CONTAINER_NAME: z.string().default("postgres"),
		DATABASE_NAME: z.string(),
		DATABASE_USERNAME: z.string(),
		DATABASE_PASSWORD: z.string(),
		DATABASE_URL: z.string().url(),
		DATABASE_PORT: z.coerce.number(),
		DATABASE_AUTH_TOKEN: z.string().optional(),
		SCHEDULED_TRANSACTIONS_CHECK_INTERVAL: z.coerce.number().default(300),
		JWT_SECRET: z
			.string()
			.min(32, "JWT_SECRET must be at least 32 characters long"),
	})
	.superRefine((input, ctx) => {
		if (input.NODE_ENV === "production" && !input.DATABASE_AUTH_TOKEN) {
			ctx.addIssue({
				code: z.ZodIssueCode.invalid_type,
				expected: "string",
				received: "undefined",
				path: ["DATABASE_AUTH_TOKEN"],
				message: "Must be set when NODE_ENV is 'production'",
			});
		}

		if (input.NODE_ENV === "production" && !input.DATABASE_AUTH_TOKEN) {
			ctx.addIssue({
				code: z.ZodIssueCode.invalid_type,
				expected: "string",
				received: "undefined",
				path: ["DATABASE_AUTH_TOKEN"],
				message: "Must be set when NODE_ENV is 'production'",
			});
		}
	});

export type env = z.infer<typeof EnvSchema>;

const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
	console.error("❌ Invalid env:");
	console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
	process.exit(1);
}

export default env!;
