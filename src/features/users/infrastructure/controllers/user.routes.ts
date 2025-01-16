import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import {
	createUserSchema,
	selectUsersSchema,
	updateUserSchema,
} from "@/users/application/dtos/user.dto";
import { createErrorSchema } from "stoker/openapi/schemas";

const tags = ["Users"];
const baseResponseSchema = <T extends z.ZodType>(schema: T) =>
	z.object({
		success: z.boolean(),
		data: schema,
		message: z.string(),
	});

const errorResponseSchema = z.object({
	success: z.boolean(),
	data: z.null(),
	message: z.string(),
});

export const searchByEmail = createRoute({
	path: "/users/search",
	method: "get",
	tags,
	request: {
		query: z.object({
			email: z.string().email(),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(
						z.object({
							id: z.number(),
							email: z.string(),
							name: z.string(),
							username: z.string(),
						})
					),
				},
			},
			description: "User found successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "User not found",
		},
	},
});

export const list = createRoute({
	path: "/users",
	method: "get",
	tags,
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(z.array(selectUsersSchema)),
				},
			},
			description: "Users retrieved successfully",
		},
		[HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Internal server error",
		},
	},
});

export const create = createRoute({
	path: "/users",
	method: "post",
	tags,
	request: {
		body: jsonContentRequired(createUserSchema, "User creation data"),
	},
	responses: {
		[HttpStatusCodes.CREATED]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(selectUsersSchema),
				},
			},
			description: "User created successfully",
		},
		[HttpStatusCodes.BAD_REQUEST]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Invalid user data",
		},
		[HttpStatusCodes.CONFLICT]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Email or username already exists",
		},
	},
});

export const update = createRoute({
	path: "/users/:id",
	method: "patch",
	tags,
	request: {
		body: jsonContentRequired(updateUserSchema, "User update data"),
		params: z.object({
			id: z.string().regex(/^\d+$/).transform(Number),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(selectUsersSchema),
				},
			},
			description: "User updated successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "User not found",
		},
		[HttpStatusCodes.BAD_REQUEST]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Invalid update data",
		},
		[HttpStatusCodes.CONFLICT]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Email or username already exists",
		},
	},
});

export const delete_ = createRoute({
	path: "/users/:id",
	method: "delete",
	tags,
	request: {
		params: z.object({
			id: z.string().regex(/^\d+$/).transform(Number),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(z.object({ deleted: z.boolean() })),
				},
			},
			description: "User deleted successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "User not found",
		},
	},
});

export const getById = createRoute({
	path: "/users/:id",
	method: "get",
	tags,
	request: {
		params: z.object({
			id: z.string().regex(/^\d+$/).transform(Number),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(selectUsersSchema),
				},
			},
			description: "User retrieved successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "User not found",
		},
	},
});

export const setRecoveryToken = createRoute({
	path: "/users/recovery-token",
	method: "post",
	tags,
	request: {
		body: jsonContentRequired(
			z.object({ id: z.number() }),
			"User ID for recovery token"
		),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(z.object({ token: z.string() })),
				},
			},
			description: "Recovery token generated successfully",
		},
		[HttpStatusCodes.NOT_FOUND]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "User not found",
		},
	},
});

export const resetPassword = createRoute({
	path: "/users/reset-password",
	method: "post",
	tags,
	request: {
		body: jsonContent(
			z.object({
				token: z.string(),
				newPassword: z.string().min(8),
			}),
			"Password reset data"
		),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: baseResponseSchema(z.object({ reset: z.boolean() })),
				},
			},
			description: "Password reset successful",
		},
		[HttpStatusCodes.BAD_REQUEST]: {
			content: {
				"application/json": {
					schema: errorResponseSchema,
				},
			},
			description: "Invalid or expired token",
		},
	},
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type UpdateRoute = typeof update;
export type DeleteRoute = typeof delete_;
export type GetByIdRoute = typeof getById;
export type SetRecoveryTokenRoute = typeof setRecoveryToken;
export type ResetPasswordRoute = typeof resetPassword;
export type SearchByEmailRoute = typeof searchByEmail;
