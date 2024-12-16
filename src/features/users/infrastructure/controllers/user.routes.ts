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

export const list = createRoute({
	path: "/users",
	method: "get",
	tags,
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.array(selectUsersSchema),
			"List of users"
		),
		[HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
			content: {
				"application/json": {
					schema: z.object({
						error: z.string(),
					}),
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
		[HttpStatusCodes.CREATED]: jsonContent(
			selectUsersSchema,
			"User created successfully"
		),
		[HttpStatusCodes.BAD_REQUEST]: jsonContent(
			createErrorSchema(createUserSchema),
			"Invalid user data"
		),
		[HttpStatusCodes.CONFLICT]: {
			content: {
				"application/json": {
					schema: z.object({
						error: z.string(),
					}),
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
		[HttpStatusCodes.OK]: jsonContent(
			selectUsersSchema,
			"User updated successfully"
		),
		[HttpStatusCodes.NOT_FOUND]: {
			description: "User not found",
		},
		[HttpStatusCodes.BAD_REQUEST]: jsonContent(
			createErrorSchema(updateUserSchema),
			"Invalid update data"
		),
		[HttpStatusCodes.CONFLICT]: {
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
		[HttpStatusCodes.OK]: jsonContent(
			z.object({ success: z.boolean() }),
			"User deleted successfully"
		),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(z.object({ id: z.number() })),
			"Invalid id error"
		),
		[HttpStatusCodes.NOT_FOUND]: {
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
		[HttpStatusCodes.OK]: jsonContent(
			selectUsersSchema,
			"User retrieved successfully"
		),
		[HttpStatusCodes.NOT_FOUND]: { description: "User not found" },
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
		[HttpStatusCodes.OK]: jsonContent(
			z.object({ token: z.string() }),
			"Recovery token generated"
		),
		[HttpStatusCodes.NOT_FOUND]: { description: "User not found" },
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
		[HttpStatusCodes.OK]: jsonContent(
			z.object({ success: z.boolean() }),
			"Password reset successful"
		),
		[HttpStatusCodes.BAD_REQUEST]: { description: "Invalid or expired token" },
	},
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type UpdateRoute = typeof update;
export type DeleteRoute = typeof delete_;
export type GetByIdRoute = typeof getById;
export type SetRecoveryTokenRoute = typeof setRecoveryToken;
export type ResetPasswordRoute = typeof resetPassword;
