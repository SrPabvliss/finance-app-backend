import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";
import { createUserSchema } from "@/users/application/dtos/create-user.dto";
import { updateUserSchema } from "@/users/application/dtos/update-user.dto";

const UserResponseSchema = z
	.object({
		id: z.number(),
		username: z.string(),
		email: z.string(),
		name: z.string(),
		active: z.boolean(),
		registrationDate: z.string(),
	})
	.transform((user) => {
		return {
			...user,
			passwordHash: undefined,
			recoveryToken: undefined,
			recoveryTokenExpires: undefined,
		};
	});

const PasswordResetRequestSchema = z.object({
	email: z.string().email(),
});

const PasswordResetSchema = z.object({
	token: z.string(),
	password: z.string().min(8),
});

const tags = ["Users"];

export const routes = {
	list: createRoute({
		path: "/users",
		method: "get",
		tags,
		responses: {
			[HttpStatusCodes.OK]: jsonContent(
				z.array(UserResponseSchema),
				"The list of users"
			),
		},
	}),

	create: createRoute({
		path: "/users",
		method: "post",
		request: {
			body: jsonContentRequired(createUserSchema, "The user to create"),
		},
		tags,
		responses: {
			[HttpStatusCodes.CREATED]: jsonContent(
				UserResponseSchema,
				"The created user"
			),
			[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
				createErrorSchema(createUserSchema),
				"The validation error(s)"
			),
		},
	}),

	getOne: createRoute({
		path: "/users/{id}",
		method: "get",
		request: {
			params: IdParamsSchema,
		},
		tags,
		responses: {
			[HttpStatusCodes.OK]: jsonContent(
				UserResponseSchema,
				"The requested user"
			),
			[HttpStatusCodes.NOT_FOUND]: jsonContent(
				z.object({ message: z.string() }),
				"User not found"
			),
		},
	}),

	update: createRoute({
		path: "/users/{id}",
		method: "patch",
		request: {
			params: IdParamsSchema,
			body: jsonContentRequired(updateUserSchema, "The user updates"),
		},
		tags,
		responses: {
			[HttpStatusCodes.OK]: jsonContent(UserResponseSchema, "The updated user"),
			[HttpStatusCodes.NOT_FOUND]: jsonContent(
				z.object({ message: z.string() }),
				"User not found"
			),
			[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
				createErrorSchema(updateUserSchema),
				"The validation error(s)"
			),
		},
	}),

	delete: createRoute({
		path: "/users/{id}",
		method: "delete",
		request: {
			params: IdParamsSchema,
		},
		tags,
		responses: {
			[HttpStatusCodes.NO_CONTENT]: {
				description: "User deleted successfully",
			},
			[HttpStatusCodes.NOT_FOUND]: jsonContent(
				z.object({ message: z.string() }),
				"User not found"
			),
		},
	}),

	resetPassword: createRoute({
		path: "/users/reset-password",
		method: "post",
		request: {
			body: jsonContentRequired(PasswordResetSchema, "Password reset data"),
		},
		tags,
		responses: {
			[HttpStatusCodes.OK]: jsonContent(
				z.object({ message: z.string() }),
				"Password reset successful"
			),
			[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
				z.object({ message: z.string() }),
				"Invalid or expired token"
			),
		},
	}),
};
